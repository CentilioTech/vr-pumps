import { allProducts } from "@/components/pumps-list.js";

export const slugify = (s) => String(s).toLowerCase().trim().replace(/\s+/g, "-");

// Extract the numeric value from messy data like "3 hp", "30 mtr", "690 lpm".
export const num = (v) => {
  if (v == null) return null;
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
};

export const categories = (() => {
  const map = new Map();
  for (const p of allProducts) {
    const key = p.category;
    if (!key) continue;
    if (!map.has(key)) map.set(key, { name: key, slug: slugify(key), image: p.imageUrl, count: 0, minPrice: Infinity });
    const c = map.get(key);
    c.count += 1;
    const price = Number(p.price);
    if (!isNaN(price) && price > 0) c.minPrice = Math.min(c.minPrice, price);
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
})();

export const categoryBySlug = (slug) => categories.find((c) => c.slug === slug) || null;
export const productsByCategorySlug = (slug) => allProducts.filter((p) => slugify(p.category) === slug);
