import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Package, Pencil, Plus, ShoppingBag } from "lucide-react";
import {
  getAdminCharity,
  getCharityOrders,
  getCharityProducts,
  updateCharity,
  updateProductStatus,
} from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { useAuth, useToast } from "../../context/contexts";
import { EmptyState, ErrorState, Loader } from "../../components/Status";
import StatusBadge from "../../components/admin/StatusBadge";
import { FALLBACK_IMAGE, finalPrice, formatDate, formatDateTime, formatPrice, splitAmount, toFormData } from "../../utils/format";

function ProductsTab({ charityId }) {
  const toast = useToast();
  const { data: products, loading, error, reload, setData } = useFetch(() => getCharityProducts(charityId), [charityId]);
  const [busyId, setBusyId] = useState(null);

  const toggle = async (product) => {
    const next = product.status === "active" ? "inactive" : "active";
    setBusyId(product._id);
    try {
      await updateProductStatus(product._id, next);
      setData((list) => list.map((p) => (p._id === product._id ? { ...p, status: next } : p)));
      toast.success(`${product.title} is now ${next}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link to={`/admin/charities/${charityId}/products/new`} className="btn-primary">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>
      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add products for shoppers to buy in support of this charity." />
      ) : (
        <ul className="card divide-y divide-gray-100">
          {products.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center gap-4 p-4">
              <img
                src={p.image || FALLBACK_IMAGE}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                alt=""
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{p.title}</p>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-gray-500">
                  {formatPrice(finalPrice(p.price, p.discount))}
                  {p.discount > 0 && ` (${p.discount}% off ${formatPrice(p.price)})`} · {p.quantity} in stock
                  {p.category_id?.title && ` · ${p.category_id.title}`}
                </p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                {(p.status === "active" || p.status === "inactive" || p.status === "pending") && (
                  <button onClick={() => toggle(p)} disabled={busyId === p._id} className="btn-secondary flex-1 py-2 sm:flex-none">
                    {p.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                )}
                <Link to={`/admin/products/${p._id}/edit`} className="btn-secondary flex-1 py-2 sm:flex-none">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrdersTab({ charity }) {
  const { data: orders, loading, error, reload } = useFetch(() => getCharityOrders(charity._id), [charity._id]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (orders.length === 0) return <EmptyState icon={ShoppingBag} title="No orders yet" description="Orders for this charity's products will appear here." />;

  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const { donation } = splitAmount(revenue, charity);

  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        {orders.length} {orders.length === 1 ? "order" : "orders"} · {formatPrice(revenue)} revenue · <span className="font-medium text-brand-700">{formatPrice(donation)} donated</span>
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Donation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDateTime(o.createdAt)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{o.user_id?.name || "—"}</p>
                  <p className="text-xs text-gray-500">{o.user_id?.email}</p>
                </td>
                <td className="px-4 py-3">{o.product_id?.title || "Deleted product"}</td>
                <td className="px-4 py-3 text-right">{o.quantity}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.amount)}</td>
                <td className="px-4 py-3 text-right text-brand-700">{formatPrice(splitAmount(o.amount, charity).donation)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCharityDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { data: charity, loading, error, reload, setData } = useFetch(() => getAdminCharity(id), [id]);
  const [tab, setTab] = useState("products");
  const [savingStatus, setSavingStatus] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const isSuper = user?.role === "super_admin";
  const statusOptions = isSuper ? ["pending", "approved", "live", "closed"] : [...new Set(["pending", "closed", charity.status])];

  // The update API takes the full record, so resend the current values with the new status.
  const changeStatus = async (status) => {
    setSavingStatus(true);
    try {
      const { name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit } = charity;
      const res = await updateCharity(
        charity._id,
        toFormData({ name, description, charity_email, start_date, end_date, platform_fee, donation_fee, profit, status })
      );
      setData((c) => ({ ...c, status: res.data.data.status }));
      toast.success(`Charity is now ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div>
      <Link to="/admin/charities" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> All charities
      </Link>

      <div className="card mt-4 overflow-hidden">
        <img
          src={charity.banner || FALLBACK_IMAGE}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
          alt=""
          className="aspect-[3/1] w-full object-cover sm:aspect-[4/1]"
        />
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">{charity.name}</h2>
              <StatusBadge status={charity.status} />
            </div>
            <p className="mt-2 text-gray-600">{charity.description}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {charity.charity_email}</span>
              <span>{formatDate(charity.start_date)} – {formatDate(charity.end_date)}</span>
              {charity.user_id?.name && <span>Owner: {charity.user_id.name}</span>}
            </div>
            <p className="mt-3 text-sm">
              <span className="font-medium text-brand-700">{charity.donation_fee}% donation</span>
              <span className="text-gray-500"> · {charity.platform_fee}% platform fee · {charity.profit}% profit</span>
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <Link to={`/admin/charities/${charity._id}/edit`} className="btn-secondary w-full lg:w-auto">
              <Pencil className="h-4 w-4" /> Edit charity
            </Link>
            <div className="w-full lg:w-48">
              <label htmlFor="quick-status" className="mb-1 block text-xs text-gray-500">Status</label>
              <select
                id="quick-status"
                value={charity.status || "pending"}
                onChange={(e) => changeStatus(e.target.value)}
                disabled={savingStatus}
                className="input capitalize"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {charity.status !== "live" && (
                <p className="mt-1 text-xs text-amber-700">Products can only be ordered while the charity is live.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-1 border-b border-gray-200" role="tablist">
        {[
          ["products", "Products"],
          ["orders", "Orders"],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === key ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-5">{tab === "products" ? <ProductsTab charityId={charity._id} /> : <OrdersTab charity={charity} />}</div>
    </div>
  );
}

export default AdminCharityDetail;
