// Fixed list of product categories used across the app.
// The first entry is not a real category — it's the "All" tab on the shop.
export const CATEGORIES = [
  'Food & Beverages',
  'Clothing & Textiles',
  'Household & Cleaning',
  'Electronics',
  'Stationery & Office',
  'Hardware & Building',
  'Health & Beauty',
  'Other',
];

// A category to fall back to when a product has no category set.
export const DEFAULT_CATEGORY = 'Other';

// Helper: returns a product's category, or the default if missing/unknown.
export function getProductCategory(product) {
  const c = product?.category;
  if (typeof c === 'string' && CATEGORIES.includes(c)) return c;
  return DEFAULT_CATEGORY;
}