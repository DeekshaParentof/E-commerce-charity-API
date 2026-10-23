import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/contexts";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
