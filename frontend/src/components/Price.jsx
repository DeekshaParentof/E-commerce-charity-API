import { finalPrice, formatPrice } from "../utils/format";

function Price({ price, discount = 0, size = "md" }) {
  const final = finalPrice(price, discount);
  const big = size === "lg";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-semibold text-gray-900 ${big ? "text-3xl" : "text-lg"}`}>{formatPrice(final)}</span>
      {discount > 0 && (
        <>
          <span className={`text-gray-400 line-through ${big ? "text-base" : "text-sm"}`}>{formatPrice(price)}</span>
          <span className={`font-medium text-brand-700 ${big ? "text-base" : "text-sm"}`}>{discount}% off</span>
        </>
      )}
    </div>
  );
}

export default Price;
