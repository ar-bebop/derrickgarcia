// src/lib/mortgage-math.js
// Canadian mortgage / affordability / land-transfer-tax math.
// Regulatory constants are named + dated — verify against source before production reliance.
// last checked: 2026-06-09

export const MIN_QUALIFYING_RATE = 0.0525; // OSFI minimum qualifying rate (MQR). verify: Dept of Finance/OSFI
export const STRESS_TEST_BUFFER = 0.02;    // contract rate + 2%

// Convert a nominal annual rate to a per-period effective rate for Canadian
// FIXED-rate mortgages (semi-annual compounding — NOT annualRate/12).
export function periodicRate(annualRate, periodsPerYear = 12) {
  if (annualRate === 0) return 0;
  return Math.pow(1 + annualRate / 2, 2 / periodsPerYear) - 1;
}

// Standard annuity payment for `periodsPerYear` payments.
export function payment(principal, annualRate, amortYears, periodsPerYear = 12) {
  const n = amortYears * periodsPerYear;
  const i = periodicRate(annualRate, periodsPerYear);
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

export const FREQUENCIES = {
  monthly:             { periodsPerYear: 12, accelerated: false },
  semimonthly:         { periodsPerYear: 24, accelerated: false },
  biweekly:            { periodsPerYear: 26, accelerated: false },
  acceleratedBiweekly: { periodsPerYear: 26, accelerated: true, divisor: 2 },
  weekly:              { periodsPerYear: 52, accelerated: false },
  acceleratedWeekly:   { periodsPerYear: 52, accelerated: true, divisor: 4 },
};

// Payment for a named frequency. Accelerated = the monthly payment split, paid
// more often (≈ one extra monthly payment/year → faster payoff).
export function paymentForFrequency(principal, annualRate, amortYears, freqKey) {
  const f = FREQUENCIES[freqKey];
  if (!f) throw new Error(`unknown frequency: ${freqKey}`);
  if (f.accelerated) return payment(principal, annualRate, amortYears, 12) / f.divisor;
  return payment(principal, annualRate, amortYears, f.periodsPerYear);
}

export function qualifyingRate(contractRate) {
  return Math.max(contractRate + STRESS_TEST_BUFFER, MIN_QUALIFYING_RATE);
}

// CMHC default-insurance premium rate by loan-to-value. verify: CMHC premium schedule
export function cmhcPremiumRate(ltv) {
  if (ltv > 0.90) return 0.040;
  if (ltv > 0.85) return 0.031;
  if (ltv > 0.80) return 0.028;
  return 0; // >= 20% down: conventional, not insured
}

// Premium in dollars (financed onto the principal).
export function cmhcPremium(loan, price) {
  return loan * cmhcPremiumRate(loan / price);
}
