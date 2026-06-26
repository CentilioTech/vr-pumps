import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header.js";
import Footer from "@/components/footer.js";
import { categories } from "@/lib/catalog.js";

export default function CategoriesView() {
  return (
    <div className="font-sans">
      <Header activeTab={"Categories"} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Categories</h1>
        <p className="text-gray-500 mb-8">Browse our pump series &mdash; {categories.length} ranges</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <Link key={c.slug} href={`/categories/${c.slug}`} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-50 p-6 flex items-center justify-center">
                <Image src={c.image} priority alt={c.name} width={200} height={200} className="object-contain max-h-[170px] w-auto group-hover:scale-105 transition-transform" />
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900 group-hover:text-blue-600">{c.name}</div>
                <div className="text-xs text-gray-500 mt-1">{c.count} product{c.count > 1 ? "s" : ""}</div>
                {isFinite(c.minPrice) && <div className="text-sm font-medium text-gray-900 mt-1">From &#8377;{c.minPrice.toLocaleString()}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
