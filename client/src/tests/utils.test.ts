import { describe, it, expect } from 'vitest';
import {
    formatDate,
    formatSalary,
    truncate,
    capitalize,
    getInitials,
    isValidEmail,
    isValidPhone,
    timeAgo,
} from '@/utils';

describe('formatDate', () => {
    it('returns empty string for undefined input', () => {
        expect(formatDate(undefined)).toBe('');
    });

    it('formats a valid date string', () => {
        const result = formatDate('2024-01-15');
        expect(result).toMatch(/Jan/);
        expect(result).toMatch(/2024/);
    });

    it('formats a Date object', () => {
        const result = formatDate(new Date('2023-06-01'));
        expect(result).toMatch(/Jun/);
    });

    it('accepts custom format options', () => {
        const result = formatDate('2024-01-15', { month: 'long' });
        expect(result).toMatch(/January/);
    });
});

describe('formatSalary', () => {
    it('formats value in lakhs', () => {
        expect(formatSalary(200000)).toBe('₹2.0L/mo');
    });

    it('formats value in thousands', () => {
        expect(formatSalary(15000)).toBe('₹15K/mo');
    });

    it('formats value below 1000', () => {
        expect(formatSalary(500)).toBe('₹500/mo');
    });

    it('formats a range', () => {
        expect(formatSalary(10000, 20000)).toBe('₹10K - ₹20K/mo');
    });

    it('does not show range when min === max', () => {
        expect(formatSalary(10000, 10000)).toBe('₹10K/mo');
    });

    it('uses daily suffix', () => {
        expect(formatSalary(500, undefined, 'daily')).toBe('₹500/day');
    });

    it('uses hourly suffix for any other type', () => {
        expect(formatSalary(100, undefined, 'hourly')).toBe('₹100/hr');
    });
});

describe('truncate', () => {
    it('returns text as-is if shorter than maxLength', () => {
        expect(truncate('hello', 10)).toBe('hello');
    });

    it('truncates text and appends ellipsis', () => {
        const result = truncate('hello world foo bar', 10);
        expect(result).toBe('hello worl...');
    });

    it('returns text when length equals maxLength', () => {
        expect(truncate('hello', 5)).toBe('hello');
    });

    it('handles empty string', () => {
        expect(truncate('')).toBe('');
    });

    it('uses default max of 100', () => {
        const long = 'a'.repeat(101);
        const result = truncate(long);
        expect(result.endsWith('...')).toBe(true);
        expect(result.length).toBe(103); // 100 + '...'
    });
});

describe('capitalize', () => {
    it('capitalizes each word', () => {
        expect(capitalize('hello world')).toBe('Hello World');
    });

    it('returns empty string for empty input', () => {
        expect(capitalize('')).toBe('');
    });

    it('handles single word', () => {
        expect(capitalize('react')).toBe('React');
    });
});

describe('getInitials', () => {
    it('returns ? for empty input', () => {
        expect(getInitials('')).toBe('?');
    });

    it('returns initials for a full name', () => {
        expect(getInitials('John Doe')).toBe('JD');
    });

    it('truncates to 2 characters for long names', () => {
        expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });

    it('uppercases the initials', () => {
        expect(getInitials('alice bob')).toBe('AB');
    });
});

describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('user+tag@sub.domain.io')).toBe(true);
    });

    it('returns false for invalid emails', () => {
        expect(isValidEmail('notanemail')).toBe(false);
        expect(isValidEmail('missing@domain')).toBe(false);
        expect(isValidEmail('@nodomain.com')).toBe(false);
    });
});

describe('isValidPhone', () => {
    it('returns true for valid 10-digit Indian numbers starting 6-9', () => {
        expect(isValidPhone('9876543210')).toBe(true);
        expect(isValidPhone('6123456789')).toBe(true);
    });

    it('returns false for numbers starting with 0-5', () => {
        expect(isValidPhone('1234567890')).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isValidPhone(undefined)).toBe(false);
    });

    it('strips non-digit characters before validating', () => {
        expect(isValidPhone('+91 98765 43210')).toBe(false); // 12 digits after strip
    });
});

describe('timeAgo', () => {
    it('returns empty string for undefined', () => {
        expect(timeAgo(undefined)).toBe('');
    });

    it('returns "Just now" for very recent dates', () => {
        expect(timeAgo(new Date().toISOString())).toBe('Just now');
    });

    it('returns minutes ago', () => {
        const d = new Date(Date.now() - 5 * 60 * 1000);
        expect(timeAgo(d)).toBe('5 minutes ago');
    });

    it('returns hour(s) ago', () => {
        const d = new Date(Date.now() - 2 * 3600 * 1000);
        expect(timeAgo(d)).toBe('2 hours ago');
    });

    it('returns day(s) ago', () => {
        const d = new Date(Date.now() - 3 * 86400 * 1000);
        expect(timeAgo(d)).toBe('3 days ago');
    });

    it('returns week(s) ago', () => {
        const d = new Date(Date.now() - 2 * 604800 * 1000);
        expect(timeAgo(d)).toBe('2 weeks ago');
    });

    it('returns month(s) ago', () => {
        const d = new Date(Date.now() - 2 * 2592000 * 1000);
        expect(timeAgo(d)).toBe('2 months ago');
    });

    it('returns year(s) ago', () => {
        const d = new Date(Date.now() - 2 * 31536000 * 1000);
        expect(timeAgo(d)).toBe('2 years ago');
    });

    it('uses singular for count of 1', () => {
        const d = new Date(Date.now() - 1 * 3600 * 1000);
        expect(timeAgo(d)).toBe('1 hour ago');
    });
});
