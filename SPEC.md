# Feature: 用户登录认证

## User Story
As a 网站用户, I want 使用邮箱和密码登录, so that 我可以访问我的账户信息.

As a 网站用户, I want 使用 GitHub/Google 第三方登录, so that 我可以快速登录无需注册.

## Priority
- [x] P0: 邮箱密码登录 + JWT
- [x] P0: OAuth GitHub
- [x] P1: OAuth Google
- [x] P1: Token 刷新
- [ ] P2: 忘记密码

## 功能清单
- [x] 用户注册 (邮箱 + 密码)
- [x] 用户登录 (返回 JWT)
- [x] Token 刷新
- [x] GitHub OAuth
- [x] Google OAuth
- [x] 登出

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | 用户注册 |
| POST | /auth/login | 用户登录 |
| POST | /auth/refresh | 刷新 token |
| POST | /auth/logout | 登出 |
| GET | /api/me | 获取当前用户 |
| GET | /auth/oauth/github | GitHub 登录跳转 |
| GET | /auth/oauth/github/callback | GitHub 回调 |
| GET | /auth/oauth/google | Google 登录跳转 |
| GET | /auth/oauth/google/callback | Google 回调 |

## Data Models
```typescript
interface User {
  id: string;
  email: string;
  password?: string; // hashed
  provider?: 'email' | 'github' | 'google';
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

## 验收标准 (AC)
- [x] 用户可以使用邮箱密码注册
- [x] 用户可以登录并获取 JWT token
- [x] 认证后的请求可以访问受保护资源
- [x] 可以使用 refresh token 刷新 access token
- [x] GitHub OAuth 登录可以正常工作
- [x] Google OAuth 登录可以正常工作

## 测试策略
- Unit Tests: 0 (业务逻辑简单)
- Integration Tests: 15 tests
- E2E Tests: 0 (简化版)

## 依赖
- express
- jsonwebtoken
- bcryptjs
- supertest (dev)
- jest (dev)
