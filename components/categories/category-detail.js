"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/header.js";
import Footer from "@/components/footer.js";
import FavouriteButton from "@/components/favourite-button.js";
import { productsByCategorySlug, categoryBySlug, num } from "@/lib/catalog.js";
import { useCart, useWishlist, addToCart, removeFromCart, toggleWishlist } from "@/lib/store";

export default function CategoryDetail({ slug }) {
  const cat = categoryBySlug(slug);
  const items = productsByCategorySlug(slug);
  const cart = useCart();
  const wish = useWishlist();

  return (
    <div className="font-sans">
      <Header activeTab={"Categories"} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/categories" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" /> All categories
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-1">{cat ? cat.name : slug}</h1>
        <p className="text-gray-500 mb-8">{items.length} product{items.length > 1 ? "s" : ""}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => {
            const inCartNow = cart.some((c) => c.id === product.id);
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <FavouriteButton isFavorite={wish.includes(product.id)} onToggle={() => toggleWishlist(product.id)} />
                  </div>
                  <Link href={`/pumps/${product.id}`} className="aspect-square bg-gray-50 p-6 flex items-center justify-center">
                    <Image src={product.imageUrl} priority alt={product.name} width={200} height={200} className="object-contain" />
                  </Link>
                </div>
                <div className="p-4">
                  <Link href={`/pumps/${product.id}`}><h3 className="text-md font-bold text-black mb-1 hover:text-blue-600">{product.name}</h3></Link>
                  <div className="text-sm text-gray-600 mb-2">HP: {num(product.horsePower) ?? product.horsePower} | Max Head: {num(product.maximumHead) ?? product.maximumHead} m</div>
                  <div className="text-lg font-semibold text-gray-900 mb-3">&#8377;{Number(product.price).toLocaleString()}</div>
                  <button onClick={() => (inCartNow ? removeFromCart(product.id) : addToCart(product.id, 1))} className={`w-full py-2 rounded font-medium text-white transition-colors ${inCartNow ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {inCartNow ? "Remove from cart" : "Add to cart"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
