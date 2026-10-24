import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Heart, LayoutDashboard, LogOut, MapPin, Menu, Package, ShoppingCart, X } from "lucide-react";
import { useAuth, useCart } from "../context/contexts";
import { isAdmin } from "../utils/format";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? "text-brand-700" : "text-gray-600 hover:text-gray-900"}`;

const mobileLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-brand-50 text-brand-700" : "hover:bg-gray-50"}`;

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const firstName = user?.name?.split(" ")[0] || "Account";
  const admin = isAdmin(user);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Heart className="h-4 w-4" fill="currentColor" />
          </span>
          Charity Shop
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>Shop</NavLink>
          {isAuthenticated && <NavLink to="/orders" className={navLinkClass}>Orders</NavLink>}
          {admin && <NavLink to="/admin" className={navLinkClass}>Dashboard</NavLink>}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100" aria-label={`Cart, ${count} items`}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  aria-expanded={menuOpen}
                >
                  Hi, {firstName}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <p className="truncate border-b border-gray-100 px-4 py-2 text-xs text-gray-500">{user?.email}</p>
                    {admin && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    )}
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <Package className="h-4 w-4" /> My orders
                    </Link>
                    <Link to="/addresses" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                      <MapPin className="h-4 w-4" /> Addresses
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2">Login</Link>
                <Link to="/register" className="btn-primary py-2">Sign up</Link>
              </div>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            <NavLink to="/" end className={mobileLinkClass}>Home</NavLink>
            <NavLink to="/products" className={mobileLinkClass}>Shop</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={mobileLinkClass}>My orders</NavLink>
                <NavLink to="/addresses" className={mobileLinkClass}>Addresses</NavLink>
                {admin && <NavLink to="/admin" className={mobileLinkClass}>Dashboard</NavLink>}
                <p className="mt-2 truncate border-t border-gray-100 px-3 pt-3 text-xs text-gray-500">Signed in as {user?.email}</p>
                <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                <Link to="/login" className="btn-secondary">Login</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
