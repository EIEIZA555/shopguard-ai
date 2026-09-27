import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../lib/api";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await ordersApi.checkout(
        items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }))
      );
      clearCart();
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20" data-testid="checkout-success">
        <h2 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 mb-6">Thank you for your purchase.</p>
        <button onClick={() => navigate("/orders")} className="text-brand-600 hover:underline">
          View Orders
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20" data-testid="empty-cart">
        <h2 className="text-xl font-semibold text-gray-400">Your cart is empty</h2>
      </div>
    );
  }

  return (
    <div data-testid="cart-page">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 bg-white p-4 rounded-lg border" data-testid={`cart-item-${item.product.id}`}>
            <img src={item.product.image_url} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-medium">{item.product.name}</h3>
              <p className="text-sm text-gray-500">${item.product.price.toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 border rounded" data-testid={`decrease-${item.product.id}`}>-</button>
              <span data-testid={`qty-${item.product.id}`}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 border rounded" data-testid={`increase-${item.product.id}`}>+</button>
            </div>
            <span className="font-semibold w-20 text-right">${(item.product.price * item.quantity).toFixed(2)}</span>
            <button onClick={() => removeItem(item.product.id)} className="text-red-500 text-sm" data-testid={`remove-${item.product.id}`}>Remove</button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-lg border">
        <span className="text-lg font-bold" data-testid="cart-total">Total: ${total.toFixed(2)}</span>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="bg-brand-600 text-white px-6 py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
          data-testid="checkout-btn"
        >
          {loading ? "Processing..." : "Checkout"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600" data-testid="checkout-error">{error}</p>}
    </div>
  );
}
