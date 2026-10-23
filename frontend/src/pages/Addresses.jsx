import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../services/addressService";
import { getErrorMessage } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { useToast } from "../context/contexts";
import AddressForm from "../components/AddressForm";
import { EmptyState, ErrorState, Loader } from "../components/Status";
import { formatAddress } from "../utils/format";

function Addresses() {
  const toast = useToast();
  const { data: addresses, loading, error, reload, setData } = useFetch(() => getAddresses());
  // null = no form open, "new" = adding, otherwise the address being edited
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleSave = async (values) => {
    try {
      if (editing === "new") {
        const res = await addAddress(values);
        setData((list) => [res.data.data, ...(list || [])]);
        toast.success("Address added");
      } else {
        const res = await updateAddress(editing._id, values);
        setData((list) => list.map((a) => (a._id === editing._id ? res.data.data : a)));
        toast.success("Address updated");
      }
      setEditing(null);
    } catch (err) {
      throw new Error(getErrorMessage(err), { cause: err });
    }
  };

  const handleDelete = async (address) => {
    if (!window.confirm(`Delete the address "${address.location}"?`)) return;
    setDeletingId(address._id);
    try {
      await deleteAddress(address._id);
      setData((list) => list.filter((a) => a._id !== address._id));
      toast.success("Address deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-page max-w-3xl py-8 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Addresses</h1>
          <p className="mt-1 text-sm text-gray-500">Manage where your orders are delivered.</p>
        </div>
        {!editing && addresses?.length > 0 && (
          <button onClick={() => setEditing("new")} className="btn-primary">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add address</span>
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {editing && (
          <div className="card p-5">
            <h2 className="mb-4 font-semibold">{editing === "new" ? "New address" : "Edit address"}</h2>
            <AddressForm
              key={editing === "new" ? "new" : editing._id}
              initial={editing === "new" ? null : editing}
              onSubmit={handleSave}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : addresses.length === 0 && !editing ? (
          <EmptyState
            icon={MapPin}
            title="No saved addresses"
            description="Add an address to speed up checkout."
            action={<button onClick={() => setEditing("new")} className="btn-primary">Add address</button>}
          />
        ) : (
          addresses.map((address) => (
            <div key={address._id} className="card flex items-start gap-4 p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <p className="flex-1 text-sm text-gray-700">{formatAddress(address)}</p>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => setEditing(address)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Edit address"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(address)}
                  disabled={deletingId === address._id}
                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Addresses;
