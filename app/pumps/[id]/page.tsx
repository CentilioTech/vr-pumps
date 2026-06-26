import { allProducts } from "@/components/pumps-list.js";
import ProductDetail from "@/components/pumps/product-detail.js";

export function generateStaticParams() {
  return allProducts.map((p: { id: number }) => ({ id: String(p.id) }));
}

export const dynamicParams = false;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = allProducts.find((p: { id: number }) => String(p.id) === String(id)) || null;
  return <ProductDetail product={product} />;
}
