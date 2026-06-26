import { categories } from "@/lib/catalog.js";
import CategoryDetail from "@/components/categories/category-detail.js";

export function generateStaticParams() {
  return categories.map((c: { slug: string }) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryDetail slug={slug} />;
}
