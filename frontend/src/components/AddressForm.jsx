import { useState } from "react";
import { Alert } from "./Status";

const EMPTY = { location: "", city: "", state: "", pincode: "", country: "India" };

// Mirrors backend/middlewares/validateAddress.js so users see errors before submitting.
function validate(form) {
  if (form.location.trim().length < 3) return "Address must be at least 3 characters";
  if (form.city.trim().length < 2) return "Please enter a valid city";
  if (form.state.trim().length < 2) return "Please enter a valid state";
  if (!/^[1-9][0-9]{5}$/.test(form.pincode)) return "Pincode must be a valid 6-digit number";
  return "";
}

function AddressForm({ initial, onSubmit, onCancel, submitLabel = "Save address" }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(initial && {
      location: initial.location,
      city: initial.city,
      state: initial.state,
      pincode: String(initial.pincode),
      country: initial.country || "India",
    }),
  }));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate(form);
    if (message) return setError(message);
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        location: form.location.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "India",
        pincode: Number(form.pincode),
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert>{error}</Alert>}
      <div>
        <label htmlFor="location" className="label">Address (house no., street, area)</label>
        <input id="location" name="location" value={form.location} onChange={handleChange} className="input" autoComplete="street-address" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="label">City</label>
          <input id="city" name="city" value={form.city} onChange={handleChange} className="input" autoComplete="address-level2" required />
        </div>
        <div>
          <label htmlFor="state" className="label">State</label>
          <input id="state" name="state" value={form.state} onChange={handleChange} className="input" autoComplete="address-level1" required />
        </div>
        <div>
          <label htmlFor="pincode" className="label">Pincode</label>
          <input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} className="input" inputMode="numeric" maxLength={6} autoComplete="postal-code" required />
        </div>
        <div>
          <label htmlFor="country" className="label">Country</label>
          <input id="country" name="country" value={form.country} onChange={handleChange} className="input" autoComplete="country-name" />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
