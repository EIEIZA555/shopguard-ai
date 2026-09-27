import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ShopPage from "./pages/ShopPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import TestDashboardPage from "./pages/TestDashboardPage";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ShopPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="admin/tests" element={<ProtectedRoute adminOnly><TestDashboardPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
