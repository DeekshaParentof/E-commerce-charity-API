import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ChevronRight, Package } from "lucide-react";
import { getOrders } from "../services/orderService";
import { useFetch } from "../hooks/useFetch";
import { EmptyState, ErrorState, Loader } from "../components/Status";
import { FALLBACK_IMAGE, formatDate, formatPrice } from "../utils/format";

const shortId = (id) => `#${id.slice(-8).toUpperCase()}`;

function Orders() {
  const { data: orders, loading, error, reload } = useFetch(() => getOrders());
  const location = useLocation();
  const justPlaced = location.state?.placed;

  return (
    <div className="container-page max-w-4xl py-8 sm:py-10">
      <h1 className="text-3xl font-bold">My orders</h1>
      <p className="mt-1 text-sm text-gray-500">Track everything you&apos;ve ordered and the causes you&apos;ve supported.</p>

      {justPlaced > 0 && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-700" />
          <div>
            <p className="font-medium text-brand-900">Thank you for your order!</p>
            <p className="text-sm text-brand-800">
              {justPlaced === 1 ? "Your order has" : `${justPlaced} orders have`} been placed. A confirmation will be sent to you shortly.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <Loader label="Loading orders..." />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, it will show up here."
            action={<Link to="/products" className="btn-primary">Start shopping</Link>}
          />
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order._id}>
                <Link to={`/orders/${order._id}`} className="card flex items-center gap-4 p-4 transition hover:shadow-md">
                  <img
                    src={order.product_id?.image || FALLBACK_IMAGE}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{order.product_id?.title || "Product no longer available"}</p>
                    <p className="text-sm text-gray-500">
                      Qty {order.quantity} · {formatDate(order.createdAt)}
                    </p>
                    {order.charity_id?.name && <p className="truncate text-xs text-brand-700">Supports {order.charity_id.name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(order.amount)}</p>
                    <p className="text-xs text-gray-400">{shortId(order._id)}</p>
                  </div>
                  <ChevronRight className="hidden h-5 w-5 shrink-0 text-gray-400 sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Orders;
