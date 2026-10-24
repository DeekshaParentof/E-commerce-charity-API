import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createProduct, getAdminCategories, getProduct, updateProduct } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { useToast } from "../../context/contexts";
import ImageInput from "../../components/admin/ImageInput";
import { Alert, ErrorState, Loader } from "../../components/Status";
import { finalPrice, formatPrice, toFormData } from "../../utils/format";

const EMPTY = {
  title: "",
  short_description: "",
  long_description: "",
  price: "",
  discount: "0",
  quantity: "25",
  status: "active",
  category_id: "",
};

// Mirrors backend/middlewares/validateProduct.js
function validate(form, { isNew, hasImage }) {
  if (!form.title.trim()) return "Title is required";
  const short = form.short_description.trim().length;
  if (short < 10 || short > 15) return "Short description must be 10-15 characters";
  const long = form.long_description.trim().length;
  if (long < 20 || long > 50) return "Long description must be 20-50 characters";
  if (!(Number(form.price) >= 1)) return "Price must be a positive number";
  const discount = Number(form.discount);
  if (Number.isNaN(discount) || discount < 0 || discount > 100) return "Discount must be between 0 and 100%";
  const qty = Number(form.quantity);
  if (!Number.isInteger(qty)) return "Quantity must be a whole number";
  if (isNew && (qty < 25 || qty > 50)) return "Initial quantity must be between 25 and 50";
  if (!isNew && qty < 0) return "Quantity can't be negative";
  if (!form.category_id) return "Choose a category";
  if (isNew && !hasImage) return "A product image is required";
  return "";
}

function ProductForm() {
  // New: /admin/charities/:charityId/products/new — Edit: /admin/products/:id/edit
  const { charityId: routeCharityId, id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [charityId, setCharityId] = useState(routeCharityId || "");
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAdminCategories(), isNew ? null : getProduct(id)])
      .then(([cats, product]) => {
        setCategories(cats.data.data);
        if (product) {
          const p = product.data.data;
          setForm({
            title: p.title,
            short_description: p.short_description,
            long_description: p.long_description,
            price: String(p.price),
            discount: String(p.discount || 0),
            quantity: String(p.quantity),
            status: p.status || "pending",
            category_id: p.category_id?._id || p.category_id || "",
          });
          setCharityId(p.charity_id?._id || p.charity_id);
          setCurrentImage(p.image);
        } else if (cats.data.data.length === 1) {
          setForm((f) => ({ ...f, category_id: cats.data.data[0]._id }));
        }
      })
      .catch((err) => setLoadError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = validate(form, { isNew, hasImage: Boolean(image) });
    if (message) return setError(message);
    setError("");
    setSaving(true);
    try {
      const payload = toFormData({
        ...form,
        title: form.title.trim(),
        short_description: form.short_description.trim(),
        long_description: form.long_description.trim(),
        charity_id: charityId,
        image,
      });
      if (isNew) await createProduct(payload);
      else await updateProduct(id, payload);
      toast.success(isNew ? "Product created" : "Product updated");
      navigate(`/admin/charities/${charityId}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (loadError) return <ErrorState message={loadError} />;

  const backTo = `/admin/charities/${charityId}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> Back to charity
      </Link>
      <h2 className="mt-3 text-2xl font-bold">{isNew ? "New product" : "Edit product"}</h2>

      {categories.length === 0 ? (
        <Alert>
          You need a category before adding products.{" "}
          <Link to="/admin/categories" className="font-medium underline">Create a category</Link>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="card mt-6 grid gap-6 p-5 sm:p-6 md:grid-cols-[240px,1fr]" noValidate>
          <div className="md:col-span-2">{error && <Alert>{error}</Alert>}</div>

          <ImageInput id="image" label="Image" currentUrl={currentImage} onChange={setImage} onError={setError} required={isNew} />

          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="label">Title</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label htmlFor="short_description" className="label">Short description</label>
              <input id="short_description" name="short_description" value={form.short_description} onChange={handleChange} className="input" maxLength={15} required />
              <p className="mt-1 text-xs text-gray-500">{form.short_description.trim().length}/15 characters (minimum 10). Shown on product cards.</p>
            </div>
            <div>
              <label htmlFor="long_description" className="label">Long description</label>
              <textarea id="long_description" name="long_description" rows={2} value={form.long_description} onChange={handleChange} className="input" maxLength={50} required />
              <p className="mt-1 text-xs text-gray-500">{form.long_description.trim().length}/50 characters (minimum 20)</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="price" className="label">Price (₹)</label>
                <input id="price" name="price" type="number" min="1" step="0.01" value={form.price} onChange={handleChange} className="input" required />
              </div>
              <div>
                <label htmlFor="discount" className="label">Discount (%)</label>
                <input id="discount" name="discount" type="number" min="0" max="100" value={form.discount} onChange={handleChange} className="input" />
              </div>
              <div>
                <label htmlFor="quantity" className="label">Stock</label>
                <input id="quantity" name="quantity" type="number" min={isNew ? 25 : 0} max={isNew ? 50 : undefined} value={form.quantity} onChange={handleChange} className="input" required />
              </div>
            </div>
            {Number(form.price) > 0 && (
              <p className="text-sm text-gray-600">
                Customers pay <span className="font-semibold">{formatPrice(finalPrice(form.price, form.discount))}</span>
                {isNew && <span className="text-gray-500"> · new products start with 25-50 units</span>}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="category_id" className="label">Category</label>
                <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange} className="input" required>
                  <option value="">Select…</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange} className="input capitalize">
                  {["active", "pending", "inactive", "sold"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end md:col-span-2">
            <Link to={backTo} className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (image ? "Uploading..." : "Saving...") : isNew ? "Create product" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProductForm;
