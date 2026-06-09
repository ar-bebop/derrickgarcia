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

import { qualifyingRate, cmhcPremiumRate, cmhcPremium } from './mortgage-math.js';

describe('qualifyingRate (stress test)', () => {
  it('uses contract + 2% when that exceeds the 5.25% floor', () => {
    expect(qualifyingRate(0.05)).toBeCloseTo(0.07, 10);
  });
  it('uses the 5.25% floor when contract + 2% is lower', () => {
    expect(qualifyingRate(0.02)).toBeCloseTo(0.0525, 10);
  });
});

describe('cmhcPremiumRate by loan-to-value', () => {
  it('5% down (95% LTV) → 4.00%', () => { expect(cmhcPremiumRate(0.95)).toBe(0.040); });
  it('10% down (90% LTV) → 3.10%', () => { expect(cmhcPremiumRate(0.90)).toBe(0.031); });
  it('15% down (85% LTV) → 2.80%', () => { expect(cmhcPremiumRate(0.85)).toBe(0.028); });
  it('20% down (80% LTV) → 0%', () => { expect(cmhcPremiumRate(0.80)).toBe(0); });
});

describe('cmhcPremium', () => {
  it('5% down on a $500k home → $19,000', () => {
    expect(cmhcPremium(475000, 500000)).toBeCloseTo(19000, 2);
  });
});
