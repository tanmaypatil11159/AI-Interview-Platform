import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import isAuth from './isAuth.js';

process.env.JWT_SECRET = 'test-secret';

test('accepts a Bearer token from the Authorization header', async () => {
  const token = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
    cookies: {},
  };

  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  await isAuth(req, res, next);

  assert.equal(nextCalled, true);
  assert.equal(req.userId, 'user-123');
  assert.equal(res.statusCode, null);
});
