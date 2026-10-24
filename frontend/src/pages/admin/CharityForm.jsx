import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createCharity, getAdminCharity, updateCharity } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { useAuth, useToast } from "../../context/contexts";
import ImageInput from "../../components/admin/ImageInput";
import { Alert, ErrorState, Loader } from "../../components/Status";
import { localInputToUtc, toFormData, utcToLocalInput } from "../../utils/format";

const EMPTY = {
  name: "",
  description: "",
  charity_email: "",
  start_date: "",
  end_date: "",
  platform_fee: "10",
  donation_fee: "70",
  profit: "20",
  status: "pending",
};

const PERSONAL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "rediffmail.com", "icloud.com", "aol.com"];

// Mirrors backend/middlewares/validateCharity.js
function validate(form, { isNew, hasBanner }) {
  if (!/^[A-Za-z][A-Za-z\s&'.-]*$/.test(form.name.trim())) return "Name should contain letters and spaces only";
  const desc = form.description.trim().length;
  if (desc < 30 || desc > 100) return "Description must be 30-100 characters";
  if (!/^\S+@\S+\.\S+$/.test(form.charity_email)) return "Enter a valid charity email";
  if (PERSONAL_DOMAINS.includes(form.charity_email.split("@")[1]?.toLowerCase()))
    return "Use an official organisation email, not a personal provider";
  if (!form.start_date || !form.end_date) return "Start and end dates are required";
  if (isNew && new Date(form.start_date) <= new Date()) return "Start date must be in the future";
  if (new Date(form.end_date) <= new Date(form.start_date)) return "End date must be after the start date";
  const fees = ["platform_fee", "donation_fee", "profit"].map((k) => Number(form[k]));
  if (fees.some((f) => Number.isNaN(f) || f < 0 || f > 100)) return "Fees must be percentages between 0 and 100";
  if (fees.reduce((a, b) => a + b, 0) > 100) return "Platform fee + donation + profit can't exceed 100%";
  if (isNew && !hasBanner) return "A banner image is required";
  return "";
}

function CharityForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const isSuper = user?.role === "super_admin";

  const [form, setForm] = useState(EMPTY);
  const [banner, setBanner] = useState(null);
  const [currentBanner, setCurrentBanner] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    getAdminCharity(id)
      .then((res) => {
        const c = res.data.data;
        setForm({
          name: c.name,
          description: c.description,
          charity_email: c.charity_email,
          start_date: utcToLocalInput(c.start_date),
          end_date: utcToLocalInput(c.end_date),
          platform_fee: String(c.platform_fee ?? 10),
          donation_fee: String(c.donation_fee ?? 70),
          profit: String(c.profit ?? 20),
          status: c.status || "pending",
        });
        setCurrentBanner(c.banner);
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate(form, { isNew, hasBanner: Boolean(banner) });
    if (message) return setError(message);
    setError("");
    setSaving(true);
    try {
      const payload = toFormData({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        charity_email: form.charity_email.trim(),
        start_date: localInputToUtc(form.start_date),
        end_date: localInputToUtc(form.end_date),
        banner,
      });
      const res = isNew ? await createCharity(payload) : await updateCharity(id, payload);
      toast.success(isNew ? "Charity created" : "Charity updated");
      navigate(`/admin/charities/${res.data.data._id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (loadError) return <ErrorState message={loadError} />;

  const feeTotal = ["platform_fee", "donation_fee", "profit"].reduce((sum, k) => sum + (Number(form[k]) || 0), 0);
  // Admins can't approve or go live; keep the current value selectable so edits don't fail.
  const statusOptions = isSuper ? ["pending", "approved", "live", "closed"] : [...new Set(["pending", "closed", form.status])];

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={isNew ? "/admin/charities" : `/admin/charities/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <h2 className="mt-3 text-2xl font-bold">{isNew ? "New charity" : "Edit charity"}</h2>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-5 p-5 sm:p-6" noValidate>
        {error && <Alert>{error}</Alert>}

        <ImageInput id="banner" label="Banner" currentUrl={currentBanner} onChange={setBanner} onError={setError} required={isNew} aspect="aspect-[2/1]" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="charity_email" className="label">Charity email</label>
            <input id="charity_email" name="charity_email" type="email" value={form.charity_email} onChange={handleChange} className="input" placeholder="contact@your-org.org" required />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} className="input" maxLength={100} required />
          <p className="mt-1 text-xs text-gray-500">{form.description.trim().length}/100 characters (minimum 30)</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="start_date" className="label">Starts</label>
            <input id="start_date" name="start_date" type="datetime-local" value={form.start_date} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label htmlFor="end_date" className="label">Ends</label>
            <input id="end_date" name="end_date" type="datetime-local" value={form.end_date} onChange={handleChange} className="input" required />
          </div>
        </div>

        <fieldset>
          <legend className="label">Revenue split (% of each sale)</legend>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["donation_fee", "Donation"],
              ["platform_fee", "Platform fee"],
              ["profit", "Profit"],
            ].map(([key, label]) => (
              <div key={key}>
                <label htmlFor={key} className="mb-1 block text-xs text-gray-500">{label}</label>
                <input id={key} name={key} type="number" min="0" max="100" value={form[key]} onChange={handleChange} className="input" />
              </div>
            ))}
          </div>
          <p className={`mt-1.5 text-xs ${feeTotal > 100 ? "text-red-600" : "text-gray-500"}`}>Total: {feeTotal}% (max 100%)</p>
        </fieldset>

        <div className="sm:w-1/2">
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange} className="input capitalize">
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {!isSuper && <p className="mt-1.5 text-xs text-gray-500">A super admin approves charities and makes them live.</p>}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <Link to={isNew ? "/admin/charities" : `/admin/charities/${id}`} className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (banner ? "Uploading..." : "Saving...") : isNew ? "Create charity" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CharityForm;
