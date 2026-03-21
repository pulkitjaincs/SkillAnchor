import { describe, it, expect } from 'vitest';
import { sanitizeData } from '../middleware/sanitize.middleware.js';

describe('Sanitize Middleware - Unit Tests', () => {
    it('should remove keys starting with $ at the top level', () => {
        const input = {
            username: 'testuser',
            $gt: { password: '' }, // Injection attempt
            validField: 123
        };
        const output = sanitizeData({ ...input });

        expect(output).toHaveProperty('username');
        expect(output).toHaveProperty('validField');
        expect(output).not.toHaveProperty('$gt');
    });

    it('should recursively remove keys starting with $ in nested objects', () => {
        const input = {
            filter: {
                status: 'active',
                $or: [{ role: 'admin' }, { role: 'user' }]
            },
            profile: {
                $where: "this.age > 18"
            }
        };
        const output = sanitizeData(JSON.parse(JSON.stringify(input)));

        expect(output.filter.status).toBe('active');
        expect(output.filter).not.toHaveProperty('$or');
        expect(output.profile).not.toHaveProperty('$where');
    });

    it('should handle arrays containing objects', () => {
        const input = {
            items: [
                { id: 1, $secret: 'hide' },
                { id: 2, name: 'ok' }
            ]
        };
        const output = sanitizeData(JSON.parse(JSON.stringify(input)));

        expect(output.items[0]).toHaveProperty('id');
        expect(output.items[0]).not.toHaveProperty('$secret');
        expect(output.items[1].name).toBe('ok');
    });
});
