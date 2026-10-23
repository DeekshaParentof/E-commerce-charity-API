import { useCallback, useEffect, useMemo, useState } from "react";
import { finalPrice } from "../utils/format";
import { CartContext } from "./contexts";

const CART_STORAGE_KEY = "cart";

function readCart() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

const clamp = (qty, stock) => Math.max(1, Math.min(Number(qty) || 1, stock || Infinity));

// The backend has no cart API, so the cart lives in the browser and is
// turned into one order per item at checkout.
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.product_id === product._id);
      if (existing) {
        return current.map((i) =>
          i.product_id === product._id ? { ...i, quantity: clamp(i.quantity + quantity, i.stock) } : i
        );
      }
      return [
        ...current,
        {
          product_id: product._id,
          charity_id: product.charity_id?._id || product.charity_id,
          charity_name: product.charity_id?.name || "",
          title: product.title,
          image: product.image,
          price: product.price,
          discount: product.discount || 0,
          stock: product.quantity,
          quantity: clamp(quantity, product.quantity),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current.map((i) => (i.product_id === productId ? { ...i, quantity: clamp(quantity, i.stock) } : i))
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((i) => i.product_id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = items.reduce((sum, i) => sum + finalPrice(i.price, i.discount) * i.quantity, 0);
    return { items, count, subtotal, total, savings: subtotal - total, addItem, updateQuantity, removeItem, clearCart };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
