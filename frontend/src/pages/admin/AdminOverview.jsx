import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HandHeart, Plus } from "lucide-react";
import { getAdminCharities, getCharityOrders, getCharityProducts } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { EmptyState, ErrorState, Loader } from "../../components/Status";
import StatusBadge from "../../components/admin/StatusBadge";
import { formatDate, formatPrice, splitAmount } from "../../utils/format";

function Stat({ label, value, hint }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function AdminOverview() {
  const [state, setState] = useState({ loading: true, error: "", charities: [], products: [], orders: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: "" }));
        const charities = (await getAdminCharities()).data.data;
        const perCharity = await Promise.all(
          charities.map(async (c) => {
            const [products, orders] = await Promise.all([getCharityProducts(c._id), getCharityOrders(c._id)]);
            return { products: products.data.data, orders: orders.data.data.map((o) => ({ ...o, charity: c })) };
          })
        );
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          charities,
          products: perCharity.flatMap((p) => p.products),
          orders: perCharity.flatMap((p) => p.orders).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        });
      } catch (err) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (state.loading) return <Loader label="Loading dashboard..." />;
  if (state.error) return <ErrorState message={state.error} onRetry={() => setAttempt((a) => a + 1)} />;

  const { charities, products, orders } = state;
  if (charities.length === 0) {
    return (
      <EmptyState
        icon={HandHeart}
        title="No charities yet"
        description="Create your first charity campaign, then add products to it."
        action={<Link to="/admin/charities/new" className="btn-primary"><Plus className="h-4 w-4" /> New charity</Link>}
      />
    );
  }

  const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const totals = orders.reduce(
    (acc, o) => {
      const s = splitAmount(o.amount, o.charity);
      return { donation: acc.donation + s.donation, platform: acc.platform + s.platform, profit: acc.profit + s.profit };
    },
    { donation: 0, platform: 0, profit: 0 }
  );
  const live = charities.filter((c) => c.status === "live").length;
  const activeProducts = products.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Charities" value={charities.length} hint={`${live} live`} />
        <Stat label="Products" value={products.length} hint={`${activeProducts} active`} />
        <Stat label="Orders" value={orders.length} />
        <Stat label="Revenue" value={formatPrice(revenue)} hint={`${formatPrice(totals.donation)} to charities`} />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Where the money goes</h2>
        {revenue === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No sales yet.</p>
        ) : (
          <>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-brand-600" style={{ width: `${(totals.donation / revenue) * 100}%` }} />
              <div className="bg-blue-500" style={{ width: `${(totals.platform / revenue) * 100}%` }} />
              <div className="bg-amber-400" style={{ width: `${(totals.profit / revenue) * 100}%` }} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              {[
                ["Donations", totals.donation, "bg-brand-600"],
                ["Platform fees", totals.platform, "bg-blue-500"],
                ["Profit", totals.profit, "bg-amber-400"],
              ].map(([label, value, color]) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <dt className="text-gray-600">{label}</dt>
                  <dd className="ml-auto font-semibold sm:ml-2">{formatPrice(value)}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold">Charities</h2>
            <Link to="/admin/charities" className="text-sm font-medium text-brand-700 hover:underline">Manage</Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {charities.slice(0, 5).map((c) => (
              <li key={c._id}>
                <Link to={`/admin/charities/${c._id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  <StatusBadge status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold">Recent orders</h2>
          </div>
          {orders.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {orders.slice(0, 5).map((o) => (
                <li key={o._id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{o.product_id?.title || "Deleted product"} × {o.quantity}</p>
                    <p className="truncate text-xs text-gray-500">{o.user_id?.name || "Customer"} · {formatDate(o.createdAt)}</p>
                  </div>
                  <span className="shrink-0 font-semibold">{formatPrice(o.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
