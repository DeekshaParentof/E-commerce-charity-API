import { NavLink, Outlet } from "react-router-dom";
import { HandHeart, LayoutDashboard, Tags } from "lucide-react";
import { useAuth } from "../../context/contexts";

const tabs = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/charities", label: "Charities", icon: HandHeart },
  { to: "/admin/categories", label: "Categories", icon: Tags },
];

function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            {user?.role === "super_admin" ? "Super admin" : "Admin"}
          </p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </div>

      <nav className="-mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-gray-200 px-4 sm:mx-0 sm:px-0" aria-label="Admin sections">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive ? "border-brand-600 text-brand-700" : "border-transparent text-gray-500 hover:text-gray-900"
              }`
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
