export function npr(amount: number): string {
  // "Rs." to match the reference storefront styling.
  return `Rs. ${Math.round(amount)}`;
}

export function discountPct(price: number, comparePrice?: number): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}
