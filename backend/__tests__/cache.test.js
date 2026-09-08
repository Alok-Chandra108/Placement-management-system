const { getCache, setCache, invalidateCache } = require('../services/cache.service');
const redisConfig = require('../config/redis');

describe('Cache Service (Redis Cache-Aside)', () => {
  let mockRedisClient;

  beforeEach(() => {
    const memoryStore = new Map();
    mockRedisClient = {
      isOpen: true,
      get: jest.fn(async (key) => memoryStore.get(key) || null),
      setEx: jest.fn(async (key, ttl, value) => {
        memoryStore.set(key, value);
        return 'OK';
      }),
      del: jest.fn(async (keys) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach(k => memoryStore.delete(k));
        return keyList.length;
      }),
      keys: jest.fn(async (pattern) => {
        const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
        const matched = [];
        for (const k of memoryStore.keys()) {
          if (regex.test(k)) matched.push(k);
        }
        return matched;
      }),
    };

    jest.spyOn(redisConfig, 'getRedisClient').mockReturnValue(mockRedisClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should store and retrieve data from cache', async () => {
    const testData = { drives: [{ id: 1, companyName: 'Google' }] };
    const success = await setCache('drives:all', testData, 60);

    expect(success).toBe(true);
    expect(mockRedisClient.setEx).toHaveBeenCalledWith('drives:all', 60, JSON.stringify(testData));

    const retrieved = await getCache('drives:all');
    expect(retrieved).toEqual(testData);
  });

  it('should return null on cache miss', async () => {
    const result = await getCache('non_existent_key');
    expect(result).toBeNull();
  });

  it('should invalidate specific key', async () => {
    await setCache('drive:123', { id: 123 }, 60);
    expect(await getCache('drive:123')).toBeTruthy();

    await invalidateCache('drive:123');
    expect(await getCache('drive:123')).toBeNull();
  });

  it('should invalidate pattern-based keys (e.g., drives:*)', async () => {
    await setCache('drives:all', [{ id: 1 }], 60);
    await setCache('drives:{"page":1}', [{ id: 1 }], 60);
    await setCache('notices:all', [{ id: 2 }], 60);

    await invalidateCache('drives:*');

    expect(await getCache('drives:all')).toBeNull();
    expect(await getCache('drives:{"page":1}')).toBeNull();
    // Notices cache remains untouched
    expect(await getCache('notices:all')).toEqual([{ id: 2 }]);
  });

  it('should gracefully degrade if Redis client is null (offline/disabled)', async () => {
    jest.spyOn(redisConfig, 'getRedisClient').mockReturnValue(null);

    const getRes = await getCache('drives:all');
    expect(getRes).toBeNull();

    const setRes = await setCache('drives:all', { test: true }, 60);
    expect(setRes).toBe(false);

    const invRes = await invalidateCache('drives:*');
    expect(invRes).toBe(false);
  });
});
