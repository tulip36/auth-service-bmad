const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh';

const users = new Map();
const refreshTokens = new Map();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (users.has(email)) return res.status(400).json({ error: 'User already exists' });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  users.set(email, { email, password: hashedPassword });
  
  const accessToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.set(refreshToken, email);
  
  res.json({ accessToken, refreshToken, user: { email } });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  
  const accessToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.set(refreshToken, email);
  
  res.json({ accessToken, refreshToken, user: { email } });
});

app.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = jwt.sign({ email: decoded.email }, JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

app.post('/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) refreshTokens.delete(refreshToken);
  res.json({ message: 'Logged out' });
});

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/auth/oauth/github', (req, res) => {
  res.json({ url: 'https://github.com/login/oauth/authorize?client_id=demo' });
});

app.get('/auth/oauth/github/callback', (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });
  const mockEmail = 'github-user@example.com';
  const accessToken = jwt.sign({ email: mockEmail }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email: mockEmail }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.set(refreshToken, mockEmail);
  res.json({ accessToken, refreshToken, user: { email: mockEmail, provider: 'github' } });
});

app.get('/auth/oauth/google', (req, res) => {
  res.json({ url: 'https://accounts.google.com/oauth2/v2/auth?client_id=demo' });
});

app.get('/auth/oauth/google/callback', (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });
  const mockEmail = 'google-user@example.com';
  const accessToken = jwt.sign({ email: mockEmail }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ email: mockEmail }, REFRESH_SECRET, { expiresIn: '7d' });
  refreshTokens.set(refreshToken, mockEmail);
  res.json({ accessToken, refreshToken, user: { email: mockEmail, provider: 'google' } });
});

module.exports = app;
