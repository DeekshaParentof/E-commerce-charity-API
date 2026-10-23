import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, Plus } from "lucide-react";
import { useCart, useToast } from "../context/contexts";
import { addAddress, getAddresses } from "../services/addressService";
import { placeOrder } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import AddressForm from "../components/AddressForm";
import OrderSummary from "../components/OrderSummary";
import { Alert, ErrorState, Loader } from "../components/Status";
import { FALLBACK_IMAGE, finalPrice, formatAddress, formatPrice } from "../utils/format";

function Checkout() {
  const { items, subtotal, savings, total, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const addresses = useFetch(() => getAddresses());
  const [selectedId, setSelectedId] = useState("");
  const [addingAddress, setAddingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [failures, setFailures] = useState([]);

  // Default to the most recent address once the list loads.
  useEffect(() => {
    if (!selectedId && addresses.data?.length) setSelectedId(addresses.data[0]._id);
  }, [addresses.data, selectedId]);

  if (items.length === 0 && !placing) return <Navigate to="/cart" replace />;

  const showAddressForm = addingAddress || addresses.data?.length === 0;

  const handleAddAddress = async (values) => {
    try {
      const res = await addAddress(values);
      const created = res.data.data;
      addresses.setData((list) => [created, ...(list || [])]);
      setSelectedId(created._id);
      setAddingAddress(false);
      toast.success("Address saved");
    } catch (err) {
      throw new Error(getErrorMessage(err), { cause: err });
    }
  };

  // The API creates one order per product, so each cart line is placed in turn.
  // Lines that succeed leave the cart; failures stay so the user can retry.
  const handlePlaceOrder = async () => {
    setPlacing(true);
    setFailures([]);
    const failed = [];
    let placed = 0;
    for (const item of items) {
      try {
        await placeOrder({
          product_id: item.product_id,
          charity_id: item.charity_id,
          quantity: item.quantity,
          address_id: selectedId,
        });
        placed++;
        removeItem(item.product_id);
      } catch (err) {
        failed.push({ title: item.title, message: getErrorMessage(err) });
      }
    }

    if (failed.length === 0) {
      toast.success(placed === 1 ? "Order placed. Thank you!" : `${placed} orders placed. Thank you!`);
      navigate("/orders", { replace: true, state: { placed } });
      return;
    }
    if (placed > 0) toast.success(`${placed} of ${placed + failed.length} items ordered`);
    setFailures(failed);
    setPlacing(false);
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {failures.length > 0 && (
            <Alert>
              <p className="font-medium">Some items couldn&apos;t be ordered:</p>
              <ul className="mt-1 list-disc pl-5">
                {failures.map((f) => (
                  <li key={f.title}>
                    {f.title}: {f.message}
                  </li>
                ))}
              </ul>
              <p className="mt-1">They&apos;re still in your cart. Adjust or remove them and try again.</p>
            </Alert>
          )}

          <section className="card p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">1</span>
                Delivery address
              </h2>
              {!showAddressForm && (
                <button onClick={() => setAddingAddress(true)} className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                  <Plus className="h-4 w-4" /> New address
                </button>
              )}
            </div>

            <div className="mt-4">
              {addresses.loading ? (
                <Loader label="Loading addresses..." />
              ) : addresses.error ? (
                <ErrorState message={addresses.error} onRetry={addresses.reload} />
              ) : showAddressForm ? (
                <AddressForm
                  onSubmit={handleAddAddress}
                  onCancel={addresses.data.length > 0 ? () => setAddingAddress(false) : undefined}
                  submitLabel="Save and use this address"
                />
              ) : (
                <fieldset className="space-y-3">
                  <legend className="sr-only">Choose a delivery address</legend>
                  {addresses.data.map((address) => (
                    <label
                      key={address._id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        selectedId === address._id ? "border-brand-600 bg-brand-50 ring-1 ring-brand-600" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address._id}
                        checked={selectedId === address._id}
                        onChange={() => setSelectedId(address._id)}
                        className="mt-1 accent-brand-600"
                      />
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <span className="text-sm text-gray-700">{formatAddress(address)}</span>
                    </label>
                  ))}
                  <Link to="/addresses" className="inline-block text-sm text-gray-500 hover:text-gray-900 hover:underline">
                    Manage addresses
                  </Link>
                </fieldset>
              )}
            </div>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">2</span>
              Review items
            </h2>
            <ul className="mt-4 divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.product_id} className="flex items-center gap-3 py-3">
                  <img
                    src={item.image || FALLBACK_IMAGE}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(finalPrice(item.price, item.discount) * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <Link to="/cart" className="text-sm text-gray-500 hover:text-gray-900 hover:underline">Edit cart</Link>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary subtotal={subtotal} savings={savings} total={total}>
            <button
              onClick={handlePlaceOrder}
              disabled={placing || !selectedId || showAddressForm}
              className="btn-primary mt-5 w-full py-3"
            >
              {placing ? "Placing order..." : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Place order
                </>
              )}
            </button>
            {!selectedId && !addresses.loading && (
              <p className="mt-2 text-center text-xs text-gray-500">Add a delivery address to continue.</p>
            )}
            <p className="mt-3 text-center text-xs text-gray-500">Payment is collected on delivery.</p>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
