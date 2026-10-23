import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart, useToast } from "../context/contexts";
import { FALLBACK_IMAGE, isPurchasable } from "../utils/format";
import Price from "./Price";

function ProductCard({ product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const available = isPurchasable(product);

  const handleAdd = () => {
    addItem(product, 1);
    toast.success(`${product.title} added to cart`);
  };

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link to={`/products/${product._id}`} className="relative block aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image || FALLBACK_IMAGE}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
            {product.discount}% off
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.charity_id?.name && (
          <p className="text-xs font-medium uppercase tracking-wide text-brand-700">Supports {product.charity_id.name}</p>
        )}
        <Link to={`/products/${product._id}`} className="font-semibold text-gray-900 hover:text-brand-700">
          {product.title}
        </Link>
        <p className="text-sm text-gray-500">{product.short_description}</p>
        <div className="mt-auto pt-3">
          <Price price={product.price} discount={product.discount} />
          <button onClick={handleAdd} disabled={!available} className="btn-primary mt-3 w-full">
            <ShoppingCart className="h-4 w-4" />
            {available ? "Add to cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
