const { calculateDiscount } = require('./calculateDiscount');

test('applies no discount when percent is 0', () => {
  expect(calculateDiscount(100, 0)).toBe(100); // This passes
});

test('applies 10 percent discount correctly', () => {
  // Fix: The function calculateDiscount(100, 10) correctly returns 90.
  // The test assertion was incorrectly expecting 100.
  // Changed toBe(100) to toBe(90) so the test correctly verifies the implementation.
  expect(calculateDiscount(100, 10)).toBe(90);
});
