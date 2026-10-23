import { Link } from "react-router-dom";
import { ArrowRight, HandHeart, ShieldCheck, Truck } from "lucide-react";
import { getProducts } from "../services/productService";
import { getCategories } from "../services/categoryService";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/ProductCard";
import { ErrorState, Loader } from "../components/Status";
import { FALLBACK_IMAGE } from "../utils/format";

const features = [
  { icon: HandHeart, title: "Shop with purpose", text: "A share of every purchase goes directly to the charity behind the product." },
  { icon: ShieldCheck, title: "Verified charities", text: "Products are listed only by approved charities running live campaigns." },
  { icon: Truck, title: "Delivered to you", text: "Save multiple addresses and choose where each order goes at checkout." },
];

function Home() {
  const products = useFetch(() => getProducts({ status: "active" }));
  const categories = useFetch(() => getCategories());

  return (
    <>
      <section className="bg-gradient-to-br from-brand-50 via-white to-white">
        <div className="container-page grid items-center gap-10 py-14 sm:py-20 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
              Every order makes a difference
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Shop thoughtfully. <span className="text-brand-700">Give generously.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-gray-600">
              Discover handmade goods from charity campaigns. When you buy, part of the price funds the cause.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary px-6 py-3 text-base">
                Start shopping <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3 text-base">How it works</a>
            </div>
          </div>
          <div className="hidden grid-cols-2 gap-4 md:grid">
            {(products.data || []).slice(0, 4).map((p, i) => (
              <img
                key={p._id}
                src={p.image || FALLBACK_IMAGE}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                alt=""
                className={`aspect-square w-full rounded-2xl object-cover shadow-sm ${i % 2 ? "translate-y-6" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      {categories.data?.length > 0 && (
        <section className="container-page py-12">
          <h2 className="text-2xl font-bold">Shop by category</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.data.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="group relative aspect-[3/2] overflow-hidden rounded-xl bg-gray-200"
              >
                <img
                  src={c.image || FALLBACK_IMAGE}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 font-semibold text-white">{c.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">New arrivals</h2>
          <Link to="/products" className="text-sm font-medium text-brand-700 hover:underline">View all</Link>
        </div>
        <div className="mt-6">
          {products.loading ? (
            <Loader />
          ) : products.error ? (
            <ErrorState message={products.error} onRetry={products.reload} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.data.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="how-it-works" className="container-page scroll-mt-20 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Home;
