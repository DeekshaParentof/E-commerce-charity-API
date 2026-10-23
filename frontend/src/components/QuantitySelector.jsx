import { Minus, Plus } from "lucide-react";

function QuantitySelector({ value, onChange, max, size = "md" }) {
  const btn = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white">
      <button
        type="button"
        className={`${btn} flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">{value}</span>
      <button
        type="button"
        className={`${btn} flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={max !== undefined && value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default QuantitySelector;
