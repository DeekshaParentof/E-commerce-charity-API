import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageSearch, Search } from "lucide-react";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import { EmptyState, ErrorState, Loader } from "../components/Status";
import { finalPrice } from "../utils/format";

const sorters = {
  newest: () => 0,
  "price-asc": (a, b) => finalPrice(a.price, a.discount) - finalPrice(b.price, b.discount),
  "price-desc": (a, b) => finalPrice(b.price, b.discount) - finalPrice(a.price, a.discount),
};

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const [searchInput, setSearchInput] = useState(search);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  // Debounce typing into the URL (which triggers the fetch).
  useEffect(() => {
    if (searchInput === search) return;
    const id = setTimeout(() => updateParam("search", searchInput.trim()), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const products = useFetch(() => getProducts({ status: "active", search, category }), [search, category]);
  const categories = useFetch(() => getCategories());

  const sorted = products.data ? [...products.data].sort(sorters[sort] || sorters.newest) : [];
  const hasFilters = Boolean(search || category);

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="mt-1 text-sm text-gray-500">Every product supports a live charity campaign.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products"
              className="input pl-9"
              aria-label="Search products"
            />
          </div>
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value === "newest" ? "" : e.target.value)} className="input sm:w-44" aria-label="Sort products">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {categories.data?.length > 0 && (
        <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button
            onClick={() => updateParam("category", "")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              !category ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {categories.data.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParam("category", c._id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                category === c._id ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {products.loading ? (
          <Loader label="Loading products..." />
        ) : products.error ? (
          <ErrorState message={products.error} onRetry={products.reload} />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description={hasFilters ? "Try a different search or category." : "Check back soon for new products."}
            action={
              hasFilters && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearchParams({}, { replace: true });
                  }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              )
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {sorted.length} {sorted.length === 1 ? "product" : "products"}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sorted.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Products;
