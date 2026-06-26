"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart } from 'lucide-react';
import { allProducts } from '@/components/pumps-list.js';
import { useWishlist, removeWishlist, addToCart } from '@/lib/store';

export default function YourListsFold1() {
  const wish = useWishlist();
  const items = wish.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);

  return (
    <section className="bg-gray-50 py-10 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Your lists</h2>

        {items.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-4">Tap the heart on any pump to save it here.</p>
            <Link href="/pumps" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Browse pumps</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-shadow duration-200">
                <Link href={`/pumps/${item.id}`} className="bg-gray-100 p-6 flex items-center justify-center md:w-1/3">
                  <div className="w-40 h-32 relative">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 160px" />
                  </div>
                </Link>
                <div className="p-6 flex-1">
                  <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                  <Link href={`/pumps/${item.id}`}><h3 className="text-lg font-semibold mb-2 text-gray-900 hover:text-blue-600">{item.name}</h3></Link>
                  <p className="text-xl font-bold text-gray-900 mb-4">₹{Number(item.price).toLocaleString()}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button onClick={() => { addToCart(item.id, 1); removeWishlist(item.id); }} className="px-6 py-2 text-white bg-blue-600 rounded-full text-sm hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" /> Move to cart
                    </button>
                    <button onClick={() => removeWishlist(item.id)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-full text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
