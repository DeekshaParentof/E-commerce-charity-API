import { Link } from "react-router-dom";
import { CalendarDays, HandHeart, Plus } from "lucide-react";
import { getAdminCharities } from "../../services/adminService";
import { useFetch } from "../../hooks/useFetch";
import { EmptyState, ErrorState, Loader } from "../../components/Status";
import StatusBadge from "../../components/admin/StatusBadge";
import { FALLBACK_IMAGE, formatDate } from "../../utils/format";

function AdminCharities() {
  const { data: charities, loading, error, reload } = useFetch(() => getAdminCharities());

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">Campaigns you manage. A charity must be live for its products to be ordered.</p>
        <Link to="/admin/charities/new" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New charity</span>
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : charities.length === 0 ? (
          <EmptyState
            icon={HandHeart}
            title="No charities yet"
            description="Create a charity campaign to start listing products."
            action={<Link to="/admin/charities/new" className="btn-primary">New charity</Link>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {charities.map((c) => (
              <Link key={c._id} to={`/admin/charities/${c._id}`} className="card group overflow-hidden transition hover:shadow-md">
                <div className="aspect-[2/1] overflow-hidden bg-gray-100">
                  <img
                    src={c.banner || FALLBACK_IMAGE}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{c.name}</h2>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{c.description}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(c.start_date)} – {formatDate(c.end_date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCharities;
