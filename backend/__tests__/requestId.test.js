const request = require('supertest');
const express = require('express');
const {
  requestIdMiddleware,
  generateRequestId,
  isValidRequestId,
  extractRequestIdFromHeaders,
} = require('../middleware/requestId.middleware');

describe('Request ID Middleware', () => {
  // Create a test app for each test
  let app;

  beforeEach(() => {
    app = express();
    app.use(requestIdMiddleware);
    app.get('/test', (req, res) => {
      res.json({
        requestId: req.id,
        fromHeader: req.requestId,
      });
    });
  });

  describe('generateRequestId()', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateRequestId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateRequestId());
      }
      expect(ids.size).toBe(1000);
    });
  });

  describe('isValidRequestId()', () => {
    it('should accept valid UUID v4', () => {
      expect(isValidRequestId('550e8400-e29b-41d4-a716-446655440000'.replace(/^.{14}/, '550e8400-e29b-4')))
        .toBe(true);
    });

    it('should accept alphanumeric with hyphens/underscores', () => {
      expect(isValidRequestId('trace-abc-123_xyz')).toBe(true);
    });

    it('should reject null or undefined', () => {
      expect(isValidRequestId(null)).toBe(false);
      expect(isValidRequestId(undefined)).toBe(false);
      expect(isValidRequestId('')).toBe(false);
    });

    it('should reject strings over 64 chars', () => {
      expect(isValidRequestId('a'.repeat(65))).toBe(false);
    });

    it('should reject strings with invalid characters', () => {
      expect(isValidRequestId('hello world!')).toBe(false);
      expect(isValidRequestId('id@#$%')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(isValidRequestId(123)).toBe(false);
      expect(isValidRequestId({})).toBe(false);
      expect(isValidRequestId([])).toBe(false);
    });
  });

  describe('extractRequestIdFromHeaders()', () => {
    it('should extract X-Request-ID header', () => {
      const req = { headers: { 'x-request-id': 'abc-123' } };
      expect(extractRequestIdFromHeaders(req)).toBe('abc-123');
    });

    it('should extract X-Correlation-ID header', () => {
      const req = { headers: { 'x-correlation-id': 'corr-456' } };
      expect(extractRequestIdFromHeaders(req)).toBe('corr-456');
    });

    it('should return null when no header is present', () => {
      const req = { headers: {} };
      expect(extractRequestIdFromHeaders(req)).toBe(null);
    });
  });

  describe('requestIdMiddleware - HTTP behavior', () => {
    it('should add X-Request-ID header to response when not provided', async () => {
      const res = await request(app).get('/test');
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should add X-Correlation-ID header to response', async () => {
      const res = await request(app).get('/test');
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id']).toBe(res.headers['x-request-id']);
    });

    it('should echo client-provided X-Request-ID header', async () => {
      const clientId = 'client-trace-12345';
      const res = await request(app)
        .get('/test')
        .set('X-Request-ID', clientId);
      
      expect(res.headers['x-request-id']).toBe(clientId);
      expect(res.body.requestId).toBe(clientId);
    });

    it('should attach request ID to req.id', async () => {
      const res = await request(app).get('/test');
      expect(res.body.requestId).toBeDefined();
      expect(res.body.requestId).toBe(res.headers['x-request-id']);
    });

    it('should generate different IDs for different requests', async () => {
      const res1 = await request(app).get('/test');
      const res2 = await request(app).get('/test');
      
      expect(res1.headers['x-request-id']).not.toBe(res2.headers['x-request-id']);
    });

    it('should reject invalid client-provided IDs and generate new ones', async () => {
      const res = await request(app)
        .get('/test')
        .set('X-Request-ID', 'invalid id with spaces!@#');
      
      // Should generate new ID since the provided one is invalid
      expect(res.headers['x-request-id']).not.toBe('invalid id with spaces!@#');
      expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});
