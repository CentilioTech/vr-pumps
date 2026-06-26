"use client";
import { useState, useEffect } from "react";

const CART_KEY = "vrpumps_cart_v1";     // [{ id, qty }]
const WISH_KEY = "vrpumps_wishlist_v1"; // [id]
const EVT = "vrpumps:store";
const isClient = typeof window !== "undefined";

function read(key, def) {
  if (!isClient) return def;
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : def; }
  catch { return def; }
}
function write(key, val) {
  if (!isClient) return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event(EVT));
}

export function getCart() { return read(CART_KEY, []); }
export function getWishlist() { return read(WISH_KEY, []); }
export function cartCount() { return getCart().reduce((s, i) => s + (i.qty || 1), 0); }
export function wishCount() { return getWishlist().length; }
export function inCart(id) { return getCart().some((i) => i.id === id); }
export function inWishlist(id) { return getWishlist().includes(id); }

export function addToCart(id, qty = 1) {
  const c = getCart(); const e = c.find((i) => i.id === id);
  if (e) e.qty = (e.qty || 1) + qty; else c.push({ id, qty });
  write(CART_KEY, c);
}
export function setQty(id, qty) {
  let c = getCart();
  if (qty < 1) { c = c.filter((i) => i.id !== id); }
  else { const e = c.find((i) => i.id === id); if (e) e.qty = qty; else c.push({ id, qty }); }
  write(CART_KEY, c);
}
export function removeFromCart(id) { write(CART_KEY, getCart().filter((i) => i.id !== id)); }
export function toggleCart(id) { inCart(id) ? removeFromCart(id) : addToCart(id, 1); }
export function clearCart() { write(CART_KEY, []); }

export function toggleWishlist(id) {
  const w = getWishlist();
  write(WISH_KEY, w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);
}
export function removeWishlist(id) { write(WISH_KEY, getWishlist().filter((x) => x !== id)); }

function subscribe(cb) {
  if (!isClient) return () => {};
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}
function useStoreValue(getter, def) {
  const [v, setV] = useState(def);
  useEffect(() => { const u = () => setV(getter()); u(); return subscribe(u); }, []);
  return v;
}
export const useCart = () => useStoreValue(getCart, []);
export const useWishlist = () => useStoreValue(getWishlist, []);
export const useCartCount = () => useStoreValue(cartCount, 0);
export const useWishCount = () => useStoreValue(wishCount, 0);
