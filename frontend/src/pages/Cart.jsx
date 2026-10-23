import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useAuth, useCart } from "../context/contexts";
import QuantitySelector from "../components/QuantitySelector";
import OrderSummary from "../components/OrderSummary";
import { EmptyState } from "../components/Status";
import { FALLBACK_IMAGE, finalPrice, formatPrice } from "../utils/format";

function Cart() {
  const { items, count, subtotal, savings, total, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Find something you love. Every purchase supports a cause."
          action={<Link to="/products" className="btn-primary">Browse products</Link>}
        />
      </div>
    );
  }

  const checkout = () => navigate(isAuthenticated ? "/checkout" : "/login", { state: { from: "/checkout" } });

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <p className="mt-1 text-sm text-gray-500">{count} {count === 1 ? "item" : "items"}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ul className="card divide-y divide-gray-200 lg:col-span-2">
          {items.map((item) => (
            <li key={item.product_id} className="flex gap-4 p-4">
              <Link to={`/products/${item.product_id}`} className="shrink-0">
                <img
                  src={item.image || FALLBACK_IMAGE}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  alt={item.title}
                  className="h-20 w-20 rounded-lg object-cover sm:h-24 sm:w-24"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/products/${item.product_id}`} className="font-medium hover:text-brand-700">
                      {item.title}
                    </Link>
                    {item.charity_name && <p className="truncate text-xs text-gray-500">Supports {item.charity_name}</p>}
                  </div>
                  <p className="shrink-0 font-semibold">{formatPrice(finalPrice(item.price, item.discount) * item.quantity)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {formatPrice(finalPrice(item.price, item.discount))} each
                  {item.discount > 0 && <span className="ml-1 text-brand-700">({item.discount}% off)</span>}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <QuantitySelector size="sm" value={item.quantity} max={item.stock} onChange={(q) => updateQuantity(item.product_id, q)} />
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary subtotal={subtotal} savings={savings} total={total}>
            <button onClick={checkout} className="btn-primary mt-5 w-full py-3">
              {isAuthenticated ? "Proceed to checkout" : "Log in to checkout"}
            </button>
            <Link to="/products" className="mt-3 block text-center text-sm text-brand-700 hover:underline">
              Continue shopping
            </Link>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}

export default Cart;
