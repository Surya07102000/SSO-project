const request = require('supertest');
jest.mock('../src/middlewares/authMiddleware', () => ({
  authMiddleware: (req, res, next) => { req.user = { userId: 1, email: 'test@example.com' }; next(); }
}));
jest.mock('../src/model/init-models', () => {
  const items = [];
  let idSeq = 1;
  return {
    products: {
      findAll: jest.fn(async () => items),
      findOne: jest.fn(async ({ where: { title } }) => items.find(i => i.title === title) || null),
      findByPk: jest.fn(async (id) => items.find(i => i.id === Number(id)) || null),
      create: jest.fn(async (data) => { const rec = { id: idSeq++, ...data, save: async () => {}, destroy: async () => { const idx = items.findIndex(x => x.id === rec.id); if (idx>=0) items.splice(idx,1); } }; items.push(rec); return rec; })
    }
  };
});

const app = require('../src/app');

beforeAll(async () => {
  // do not hit real DB in tests
});

describe('Product API', () => {
  it('creates a product', async () => {
    const res = await request(app)
      .post('/api/v1/product')
      .send({ title: 'Prod A', price: 10, quantity: 5 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Prod A');
  });

  it('lists products', async () => {
    const res = await request(app).get('/api/v1/product');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('gets product by id', async () => {
    const list = await request(app).get('/api/v1/product');
    const id = list.body.data[0].id;
    const res = await request(app).get(`/api/v1/product/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(id);
  });

  it('updates product', async () => {
    const list = await request(app).get('/api/v1/product');
    const id = list.body.data[0].id;
    const res = await request(app)
      .patch(`/api/v1/product/${id}`)
      .send({ price: 15 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(15);
  });

  it('deletes product', async () => {
    const list = await request(app).get('/api/v1/product');
    const id = list.body.data[0].id;
    const res = await request(app).delete(`/api/v1/product/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});


