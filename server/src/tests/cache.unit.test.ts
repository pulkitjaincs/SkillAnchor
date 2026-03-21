import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheAside } from '../utils/cache.js';
import { redis } from '../config/redis.js';

// Mock the entire redis module
vi.mock('../config/redis.js', () => ({
    redis: {
        get: vi.fn(),
        setex: vi.fn(),
    },
}));

describe('Cache Utility - Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return cached data on HIT and NOT call fetchFn', async () => {
        const key = 'test-key';
        const cachedValue = { foo: 'bar' };
        vi.mocked(redis.get).mockResolvedValue(JSON.stringify(cachedValue));

        const fetchFn = vi.fn();

        const result = await cacheAside(key, 60, fetchFn);

        expect(result).toEqual(cachedValue);
        expect(redis.get).toHaveBeenCalledWith(key);
        expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should call fetchFn and CACHE the result on MISS', async () => {
        const key = 'test-key';
        const freshData = { hello: 'world' };
        vi.mocked(redis.get).mockResolvedValue(null);
        const fetchFn = vi.fn().mockResolvedValue(freshData);

        const result = await cacheAside(key, 60, fetchFn);

        expect(result).toEqual(freshData);
        expect(fetchFn).toHaveBeenCalledOnce();
        expect(redis.setex).toHaveBeenCalledWith(key, 60, JSON.stringify(freshData));
    });

    it('should not cache if fetchFn returns null', async () => {
        vi.mocked(redis.get).mockResolvedValue(null);
        const fetchFn = vi.fn().mockResolvedValue(null);

        const result = await cacheAside('empty', 60, fetchFn);

        expect(result).toBeNull();
        expect(redis.setex).not.toHaveBeenCalled();
    });
});
