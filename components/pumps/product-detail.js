"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import Header from "@/components/header.js";
import Footer from "@/components/footer.js";
import { useCart, useWishlist, addToCart, removeFromCart, toggleWishlist } from "@/lib/store";
import { num } from "@/lib/catalog.js";

export default function ProductDetail({ product }) {
  const cart = useCart();
  const wish = useWishlist();

  if (!product) {
    return (
      <div className="font-sans">
        <Header activeTab={"Pumps"} />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Product not found</h1>
          <Link href="/pumps" className="text-blue-600 hover:underline">&larr; Back to all pumps</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const inCartNow = cart.some((c) => c.id === product.id);
  const inWishNow = wish.includes(product.id);
  const hp = num(product.horsePower), mh = num(product.maximumHead), md = num(product.maximumDischarge);
  const specs = [
    ["Horse Power", hp != null ? `${hp} HP` : "—"],
    ["Maximum Head", mh != null ? `${mh} m` : "—"],
    ["Maximum Discharge", md != null ? `${md} LPM` : "—"],
    ["Stage", product.stage != null ? String(product.stage) : "—"],
    ["Head Range", Array.isArray(product.headRange) ? `${product.headRange[0]}–${product.headRange[1]} m` : "—"],
    ["Series", product.category || "—"],
  ];

  return (
    <div className="font-sans">
      <Header activeTab={"Pumps"} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/pumps" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to all pumps
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
            <Image src={product.imageUrl} priority alt={product.name} width={460} height={460} className="object-contain max-h-[460px] w-auto" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <div className="text-2xl font-semibold text-gray-900 mb-6">&#8377;{Number(product.price).toLocaleString()}</div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {specs.map(([k, v]) => (
                <div key={k} className="border border-gray-100 rounded-lg p-3 bg-white">
                  <div className="text-xs text-gray-500">{k}</div>
                  <div className="text-sm font-semibold text-gray-900">{v}</div>
                </div>
              ))}
            </div>

            {Array.isArray(product.applications) && product.applications.length > 0 && (
              <div className="mb-8">
                <div className="text-sm font-semibold text-gray-900 mb-2">Applications</div>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((a) => (
                    <span key={a} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => (inCartNow ? removeFromCart(product.id) : addToCart(product.id, 1))}
                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${inCartNow ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {inCartNow ? "Remove from cart" : "Add to cart"}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`px-5 py-3 rounded-lg font-medium border transition-colors inline-flex items-center gap-2 ${inWishNow ? "border-pink-500 text-pink-600 bg-pink-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
              >
                <Heart className={`w-4 h-4 ${inWishNow ? "fill-current" : ""}`} />
                {inWishNow ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
