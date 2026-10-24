import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/contexts";
import { EmptyState } from "./Status";
import { isAdmin } from "../utils/format";

// Only admins and super admins; the API enforces the same rules server-side.
function AdminRoute() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (!isAdmin(user)) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={ShieldAlert} title="Admins only" description="You need an admin account to view this page." />
      </div>
    );
  }
  return <Outlet />;
}

export default AdminRoute;
