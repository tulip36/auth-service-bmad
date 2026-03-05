const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  let accessToken, refreshToken;
  const testEmail = 'test@example.com', testPassword = 'password123';

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/auth/register').send({ email: testEmail, password: testPassword });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });
    it('should reject duplicate email', async () => {
      const res = await request(app).post('/auth/register').send({ email: testEmail, password: testPassword });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app).post('/auth/login').send({ email: testEmail, password: testPassword });
      expect(res.status).toBe(200);
    });
    it('should reject wrong password', async () => {
      const res = await request(app).post('/auth/login').send({ email: testEmail, password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token', async () => {
      const res = await request(app).post('/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });

  describe('GET /api/me', () => {
    it('should get user info with valid token', async () => {
      const res = await request(app).get('/api/me').set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });
    it('should reject request without token', async () => {
      const res = await request(app).get('/api/me');
      expect(res.status).toBe(401);
    });
  });

  describe('OAuth', () => {
    it('should return GitHub OAuth URL', async () => {
      const res = await request(app).get('/auth/oauth/github');
      expect(res.status).toBe(200);
    });
    it('should handle GitHub callback', async () => {
      const res = await request(app).get('/auth/oauth/github/callback?code=demo');
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
    });
  });
});
