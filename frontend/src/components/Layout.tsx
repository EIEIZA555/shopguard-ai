import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      className={`px-3 py-2 rounded-md text-sm font-medium transition ${
        location.pathname === path
          ? "bg-brand-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" data-testid="logo">
            <span className="text-xl font-bold text-brand-700">ShopGuard</span>
            <span className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full">AI</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLink("/", "Shop")}
            {navLink("/cart", `Cart (${count})`)}
            {user && navLink("/orders", "Orders")}
            {user?.role === "admin" && navLink("/admin/tests", "Test Dashboard")}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-500" data-testid="user-name">{user.full_name}</span>
                <button onClick={logout} className="text-sm text-red-600 hover:text-red-700" data-testid="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700" data-testid="login-link">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        ShopGuard AI — E-Commerce Testing Platform
      </footer>
    </div>
  );
}
