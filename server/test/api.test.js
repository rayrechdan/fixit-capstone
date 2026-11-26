// Back-end tests: npm test
// These tests call the API with Supertest. They check the routes that
// answer before touching the database (validation, login checks, roles).
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');

const app = createApp();

// Makes a login cookie like the one the server sets after login
function cookieFor(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
  return `token=${token}`;
}

describe('Fixit API', () => {
  test('GET /api/health answers ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('unknown routes return 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });

  test('signup with invalid data returns 400 and the list of errors', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: '', email: 'not-an-email', password: '123', role: 'pro' });

    expect(res.status).toBe(400);
    const fields = res.body.error.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password', 'trade']));
  });

  test('malformed JSON returns 400 instead of crashing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{bad json');
    expect(res.status).toBe(400);
  });

  test('protected route rejects a request without a login cookie', async () => {
    const res = await request(app).get('/api/jobs/mine');
    expect(res.status).toBe(401);
  });

  test('protected route rejects a fake token', async () => {
    const res = await request(app).get('/api/jobs/mine').set('Cookie', 'token=fake.token.value');
    expect(res.status).toBe(401);
  });

  test('a customer cannot see the pro dashboard jobs (403)', async () => {
    const res = await request(app)
      .get('/api/jobs/open')
      .set('Cookie', cookieFor({ id: 1, role: 'customer', trade: null }));
    expect(res.status).toBe(403);
  });

  test('a pro cannot book a job (403)', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Cookie', cookieFor({ id: 2, role: 'pro', trade: 'plumbing' }))
      .send({});
    expect(res.status).toBe(403);
  });

  test('booking a job in the past is rejected', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Cookie', cookieFor({ id: 1, role: 'customer', trade: null }))
      .send({ serviceId: 1, address: 'Hamra', description: 'Leak', lat: 33.9, lng: 35.5, scheduledAt: '2020-01-01T10:00:00Z' });

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe('scheduledAt');
  });
});
