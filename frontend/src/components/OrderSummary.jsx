import { formatPrice } from "../utils/format";

function OrderSummary({ subtotal, savings, total, children }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-600">Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between text-brand-700">
            <dt>Discount</dt>
            <dd>-{formatPrice(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-gray-600">Delivery</dt>
          <dd className="text-brand-700">Free</dd>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}

export default OrderSummary;
