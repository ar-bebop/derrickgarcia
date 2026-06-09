// src/lib/mortgage-math.test.js
import { describe, it, expect } from 'vitest';
import { periodicRate, payment, paymentForFrequency } from './mortgage-math.js';

describe('periodicRate (Canadian semi-annual compounding)', () => {
  it('converts 5% nominal to the monthly effective rate (NOT r/12)', () => {
    const i = periodicRate(0.05, 12);
    expect(i).toBeCloseTo(0.004124, 5);     // (1.025)^(1/6) - 1
    expect(i).toBeLessThan(0.05 / 12);       // must be below the naive US rate
  });
  it('returns 0 for a 0% rate', () => {
    expect(periodicRate(0, 12)).toBe(0);
  });
});

describe('payment', () => {
  it('computes a $500k / 25yr / 5% monthly payment ~ $2,908', () => {
    expect(Math.abs(payment(500000, 0.05, 25, 12) - 2908.13)).toBeLessThan(1.0);
  });
  it('handles 0% as straight-line principal/n', () => {
    expect(payment(120000, 0, 25, 12)).toBeCloseTo(120000 / 300, 6);
  });
});

describe('paymentForFrequency', () => {
  it('accelerated bi-weekly equals monthly / 2', () => {
    const monthly = payment(500000, 0.05, 25, 12);
    expect(paymentForFrequency(500000, 0.05, 25, 'acceleratedBiweekly')).toBeCloseTo(monthly / 2, 6);
  });
  it('regular bi-weekly is less than monthly/2', () => {
    const monthly = payment(500000, 0.05, 25, 12);
    expect(paymentForFrequency(500000, 0.05, 25, 'biweekly')).toBeLessThan(monthly / 2);
  });
  it('throws on an unknown frequency', () => {
    expect(() => paymentForFrequency(1, 0.05, 25, 'nope')).toThrow();
  });
});
