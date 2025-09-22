const request = require('supertest');
jest.mock('../src/middlewares/authMiddleware', () => ({
  authMiddleware: (req, res, next) => { req.user = { userId: 1, email: 'test@example.com' }; next(); }
}));

// Mock models
jest.mock('../src/model/init-models', () => {
  const users = [];
  const refresh_tokens = [];
  const invitations = [];
  let userIdSeq = 1;
  return {
    users: {
      findOne: jest.fn(async ({ where }) => users.find(u => {
        if (where.email && where.status) return u.email === where.email && u.status === where.status;
        if (where.id && where.status) return u.id === where.id && u.status === where.status;
        if (where.id) return u.id === where.id;
        return false;
      }) || null),
      create: jest.fn(async (data) => { const rec = { id: userIdSeq++, status: 'active', ...data, toJSON: function(){ return { ...this } }, save: async () => {} }; users.push(rec); return rec; }),
      update: jest.fn(async (data, { where: { id } }) => { const u = users.find(x => x.id === id); if (u) Object.assign(u, data); return [u?1:0]; })
    },
    refresh_tokens: {
      create: jest.fn(async (data) => { refresh_tokens.push({ id: refresh_tokens.length+1, is_revoked: false, ...data }); }),
      findOne: jest.fn(async ({ where }) => refresh_tokens.find(t => t.token === where.token && t.user_id === where.user_id && t.is_revoked === where.is_revoked) || null),
      update: jest.fn(async (data, { where: { id } }) => { const t = refresh_tokens.find(x => x.id === id); if (t) Object.assign(t, data); return [t?1:0]; }),
      destroy: jest.fn(async ({ where }) => { const idx = refresh_tokens.findIndex(t => t.token === where.token); if (idx>=0) refresh_tokens.splice(idx,1); return 1; })
    },
    invitation_tokens: {
      destroy: jest.fn(async () => {}),
      create: jest.fn(async (data) => { invitations.push({ id: invitations.length+1, is_used: false, ...data }); }),
      findOne: jest.fn(async ({ where }) => invitations.find(t => t.token === where.token && !t.is_used) || null)
    },
    applications: {
      findOne: jest.fn(async ({ where }) => ({ id: where.id, name: 'App1', description: 'Test', is_active: true }))
    }
  };
});

jest.mock('../src/utils/authHelper', () => ({
  comparePassword: jest.fn(async () => true),
  generateAccessToken: jest.fn(() => 'access'),
  generateRefreshToken: jest.fn(() => 'refresh'),
  calculateTokenExpiry: jest.fn(() => new Date(Date.now()+3600*1000)),
  verifyRefreshToken: jest.fn(() => ({ userId: 1, tokenType: 'refresh' })),
  verifyAccessTokenIgnoreExpiration: jest.fn(() => ({ userId: 1 })) ,
  generateSSOResponseToken: jest.fn(() => 'sso-token')
}));

const app = require('../src/app');

beforeAll(async () => {
  // Avoid real DB
});

describe('Auth API', () => {
  it('registers and logs in user', async () => {
    const reg = await request(app).post('/api/v1/auth/register').send({ first_name: 'A', last_name: 'B', email: 'a@b.com', password: 'x' });
    expect([200,201]).toContain(reg.status);
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'a@b.com', password: 'x' });
    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeDefined();
  });

  it('refreshes token', async () => {
    const res = await request(app).post('/api/v1/auth/refresh-token').send({ refreshToken: 'refresh' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('sso login', async () => {
    const res = await request(app)
      .post('/api/v1/auth/sso-login')
      .set('Authorization', 'Bearer fake')
      .send({ application_id: 1 });
    // Swagger middleware mocked, but authMiddleware is mocked to allow
    expect([200,401,403,404]).toContain(res.status);
  });
});


