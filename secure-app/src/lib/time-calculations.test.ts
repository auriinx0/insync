import { describe, it, expect } from 'vitest';
import { calculateDuration, formatDuration } from './time-calculations';

describe('Time Calculations', () => {
    describe('calculateDuration', () => {
        it('calculates standard 8 hour shift accurately', () => {
            const start = new Date('2026-01-20T09:00:00Z');
            const end = new Date('2026-01-20T17:00:00Z');
            expect(calculateDuration(start, end)).toBe(8.00);
        });

        it('calculates overnight shift accurately', () => {
            const start = new Date('2026-01-20T22:00:00Z'); // 10 PM
            const end = new Date('2026-01-21T06:00:00Z');   // 6 AM next day
            expect(calculateDuration(start, end)).toBe(8.00);
        });

        it('calculates short breaks correctly (15 mins)', () => {
            const start = new Date('2026-01-20T12:00:00Z');
            const end = new Date('2026-01-20T12:15:00Z');
            // 15/60 = 0.25
            expect(calculateDuration(start, end)).toBe(0.25);
        });

        it('calculates 45 mins correctly', () => {
            const start = new Date('2026-01-20T12:00:00Z');
            const end = new Date('2026-01-20T12:45:00Z');
            // 45/60 = 0.75
            expect(calculateDuration(start, end)).toBe(0.75);
        });

        it('returns negative if end is before start', () => {
            const start = new Date('2026-01-20T10:00:00Z');
            const end = new Date('2026-01-20T09:00:00Z');
            expect(calculateDuration(start, end)).toBe(-1.00);
        });
    });

    describe('formatDuration', () => {
        it('formats whole hours', () => {
            expect(formatDuration(8)).toBe('8h 0m');
        });

        it('formats decimal hours', () => {
            expect(formatDuration(8.5)).toBe('8h 30m');
        });

        it('formats complex decimals', () => {
            expect(formatDuration(1.25)).toBe('1h 15m');
        });
    });
});
