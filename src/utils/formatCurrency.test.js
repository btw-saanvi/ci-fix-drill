const { formatCurrency } = require('./formatCurrency');

test('formats currency correctly', () => {
  // Fix: When comparing objects in Jest, toBe() checks for strict object identity (reference).
  // We need to check for value equality, so we must use toEqual() instead.
  expect(formatCurrency(10.005, 'USD')).toEqual({ amount: 10.01, currency: 'USD' });
});
