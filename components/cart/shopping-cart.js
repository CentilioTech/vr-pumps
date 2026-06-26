"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Heart } from 'lucide-react';
import { allProducts } from '@/components/pumps-list.js';
import { useCart, setQty, removeFromCart, toggleWishlist } from '@/lib/store';

const ShoppingCart = () => {
  const cart = useCart();
  const cartItems = cart
    .map((c) => { const p = allProducts.find((x) => x.id === c.id); return p ? { ...p, quantity: c.qty || 1 } : null; })
    .filter(Boolean);
  const [deliveryOption, setDeliveryOption] = useState('standard');

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setQty(id, newQuantity);
  };
  const removeItem = (id) => removeFromCart(id);
  const saveForLater = (id) => { toggleWishlist(id); removeFromCart(id); };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 799 : 0;
  const tax = 0;
  const total = subtotal + deliveryFee + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Shopping cart</h1>
            <p className="text-gray-600 mt-1">{cartItems.length} items</p>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600 mb-4">Your cart is empty.</p>
              <Link href="/pumps" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Browse pumps</Link>
            </div>
          ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <Link href={`/pumps/${item.id}`} className="block w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={item.imageUrl} alt={item.name} width={96} height={96} className="w-full h-full object-contain" />
                    </Link>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="mb-3 md:mb-0">
                        <Link href={`/pumps/${item.id}`}><h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">{item.name}</h3></Link>
                        <p className="text-gray-600 text-sm">Series: {item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50" disabled={item.quantity <= 1}>
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="mx-3 text-lg font-medium w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded border border-gray-300 hover:bg-gray-50">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-6">
                        <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-gray-600 hover:text-red-600 text-sm">
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                        <button onClick={() => saveForLater(item.id)} className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm">
                          <Heart className="w-4 h-4" /> Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          <div className="mt-6">
            <Link href="/pumps" className="text-blue-600 hover:text-blue-800 text-sm font-medium">← Continue shopping</Link>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order summary</h2>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Item subtotal ({cartItems.length})</span>
              <span className="font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="py-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Delivery</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="delivery" value="standard" checked={deliveryOption === 'standard'} onChange={(e) => setDeliveryOption(e.target.value)} className="mt-1 w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium">Free - Standard delivery</span><span className="text-sm font-medium">Free</span></div>
                    <p className="text-xs text-gray-500 mt-1">Shipment may take 5-8 business days</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="radio" name="delivery" value="express" checked={deliveryOption === 'express'} onChange={(e) => setDeliveryOption(e.target.value)} className="mt-1 w-4 h-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium">₹799 - Express delivery</span></div>
                    <p className="text-xs text-gray-500 mt-1">Shipment may take 2-3 business days</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-gray-200">
              <span className="text-gray-600">Estimated tax</span><span className="font-medium">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Total</span><span className="text-lg font-semibold text-gray-900">₹{total.toLocaleString()}</span>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg mt-4 transition-colors disabled:opacity-50" disabled={cartItems.length === 0}>Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
