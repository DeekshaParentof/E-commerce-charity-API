import { useState } from "react";
import { Pencil, Plus, Tags } from "lucide-react";
import { createCategory, getAdminCategories, updateCategory } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { useFetch } from "../../hooks/useFetch";
import { useAuth, useToast } from "../../context/contexts";
import ImageInput from "../../components/admin/ImageInput";
import { Alert, EmptyState, ErrorState, Loader } from "../../components/Status";
import { FALLBACK_IMAGE, toFormData } from "../../utils/format";

function CategoryForm({ category, onSaved, onCancel }) {
  const isNew = !category;
  const [title, setTitle] = useState(category?.title || "");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("Title is required");
    if (isNew && !image) return setError("An image is required");
    setError("");
    setSaving(true);
    try {
      const payload = toFormData({ title: title.trim(), image });
      const res = isNew ? await createCategory(payload) : await updateCategory(category._id, payload);
      onSaved(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5" noValidate>
      <h2 className="font-semibold">{isNew ? "New category" : `Edit “${category.title}”`}</h2>
      {error && <Alert>{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-[200px,1fr]">
        <ImageInput
          id={`cat-image-${category?._id || "new"}`}
          label="Image"
          currentUrl={category?.image}
          onChange={setImage}
          onError={setError}
          required={isNew}
          aspect="aspect-[3/2]"
        />
        <div>
          <label htmlFor={`cat-title-${category?._id || "new"}`} className="label">Title</label>
          <input id={`cat-title-${category?._id || "new"}`} value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? (image ? "Uploading..." : "Saving...") : isNew ? "Create category" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function AdminCategories() {
  const toast = useToast();
  const { user } = useAuth();
  const { data: categories, loading, error, reload, setData } = useFetch(() => getAdminCategories());
  // null = closed, "new" = creating, otherwise the category being edited
  const [editing, setEditing] = useState(null);

  const handleSaved = (saved) => {
    setData((list) => (editing === "new" ? [saved, ...list] : list.map((c) => (c._id === saved._id ? { ...c, ...saved } : c))));
    toast.success(editing === "new" ? "Category created" : "Category updated");
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          {user?.role === "super_admin" ? "All categories on the platform." : "Categories you created. Products can only use your own categories."}
        </p>
        {!editing && (
          <button onClick={() => setEditing("new")} className="btn-primary shrink-0">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New category</span>
          </button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {editing && (
          <CategoryForm
            key={editing === "new" ? "new" : editing._id}
            category={editing === "new" ? null : editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : categories.length === 0 ? (
          !editing && <EmptyState icon={Tags} title="No categories yet" description="Create a category before adding products." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => (
              <div key={c._id} className="card overflow-hidden">
                <img
                  src={c.image || FALLBACK_IMAGE}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  alt=""
                  className="aspect-[3/2] w-full object-cover"
                />
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.title}</p>
                    {user?.role === "super_admin" && c.user_id?.name && (
                      <p className="truncate text-xs text-gray-500">by {c.user_id.name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(c)}
                    className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    aria-label={`Edit ${c.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategories;
