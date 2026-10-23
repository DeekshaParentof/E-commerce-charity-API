import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, HandHeart, ShoppingCart } from "lucide-react";
import { getProductById } from "../services/productService";
import { useFetch } from "../hooks/useFetch";
import { useCart, useToast } from "../context/contexts";
import Price from "../components/Price";
import QuantitySelector from "../components/QuantitySelector";
import { ErrorState, Loader } from "../components/Status";
import { FALLBACK_IMAGE, isPurchasable } from "../utils/format";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const { data: product, loading, error, reload } = useFetch(() => getProductById(id), [id]);

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="container-page py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );

  const available = isPurchasable(product);
  const inCart = items.find((i) => i.product_id === product._id)?.quantity || 0;
  const maxAddable = Math.max(product.quantity - inCart, 0);

  const handleAdd = (goToCart) => {
    addItem(product, quantity);
    if (goToCart) navigate("/cart");
    else toast.success(`${quantity} × ${product.title} added to cart`);
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={product.image || FALLBACK_IMAGE}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
            alt={product.title}
            className="aspect-square w-full object-cover"
          />
        </div>

        <div>
          {product.category_id?.title && (
            <Link to={`/products?category=${product.category_id._id}`} className="text-sm font-medium text-brand-700 hover:underline">
              {product.category_id.title}
            </Link>
          )}
          <h1 className="mt-1 text-3xl font-bold">{product.title}</h1>
          <p className="mt-2 text-gray-600">{product.short_description}</p>

          <div className="mt-6">
            <Price price={product.price} discount={product.discount} size="lg" />
          </div>

          <p className={`mt-2 text-sm font-medium ${available ? "text-brand-700" : "text-red-600"}`}>
            {!available
              ? "Currently unavailable"
              : product.quantity <= 10
              ? `Only ${product.quantity} left in stock`
              : "In stock"}
          </p>

          {available && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity</span>
                <QuantitySelector value={quantity} onChange={(q) => setQuantity(Math.max(1, Math.min(q, maxAddable || 1)))} max={maxAddable} />
              </div>
              {inCart > 0 && <p className="text-xs text-gray-500">You already have {inCart} in your cart.</p>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={() => handleAdd(false)} disabled={maxAddable === 0} className="btn-secondary flex-1 py-3">
                  <ShoppingCart className="h-4 w-4" /> Add to cart
                </button>
                <button onClick={() => handleAdd(true)} disabled={maxAddable === 0} className="btn-primary flex-1 py-3">
                  Buy now
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="font-semibold">About this product</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{product.long_description}</p>
          </div>

          {product.charity_id?.name && (
            <div className="mt-6 flex gap-3 rounded-xl bg-brand-50 p-4">
              <HandHeart className="h-5 w-5 shrink-0 text-brand-700" />
              <div>
                <p className="text-sm font-semibold text-brand-900">Supports {product.charity_id.name}</p>
                {product.charity_id.description && <p className="mt-1 text-sm text-brand-800">{product.charity_id.description}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
