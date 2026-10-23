import { Link, useParams } from "react-router-dom";
import { ArrowLeft, HandHeart, MapPin } from "lucide-react";
import { getOrderById } from "../services/orderService";
import { useFetch } from "../hooks/useFetch";
import { ErrorState, Loader } from "../components/Status";
import { FALLBACK_IMAGE, formatAddress, formatDate, formatPrice } from "../utils/format";

function OrderDetail() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(() => getOrderById(id), [id]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );

  const product = order.product_id;
  // Orders placed before unit_price was stored fall back to amount / quantity.
  const unitPrice = order.unit_price ?? order.amount / order.quantity;

  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
          <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">Confirmed</span>
      </div>

      <div className="card mt-6 flex gap-4 p-5">
        <img
          src={product?.image || FALLBACK_IMAGE}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          alt=""
          className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
        />
        <div className="min-w-0 flex-1">
          {product ? (
            <Link to={`/products/${product._id}`} className="font-medium hover:text-brand-700">{product.title}</Link>
          ) : (
            <p className="font-medium">Product no longer available</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formatPrice(unitPrice)} × {order.quantity}
            {order.discount > 0 && <span className="ml-1 text-brand-700">({order.discount}% off applied)</span>}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-gray-400" /> Delivery address
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            {order.shipping_address ? formatAddress(order.shipping_address) : "Not recorded for this order"}
          </p>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold">Payment summary</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Items</dt>
              <dd>{formatPrice(order.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Delivery</dt>
              <dd>Free</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(order.amount)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {order.charity_id?.name && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-brand-50 p-4">
          <HandHeart className="h-5 w-5 shrink-0 text-brand-700" />
          <p className="text-sm text-brand-900">
            This order supports <span className="font-semibold">{order.charity_id.name}</span>. Thank you!
          </p>
        </div>
      )}
    </div>
  );
}

export default OrderDetail;
