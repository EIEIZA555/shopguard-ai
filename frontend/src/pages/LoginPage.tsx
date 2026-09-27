import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("customer@shopguard.dev");
  const [password, setPassword] = useState("Test123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12" data-testid="login-page">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            data-testid="email-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            data-testid="password-input"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm" data-testid="login-error">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700 disabled:opacity-50"
          data-testid="login-submit"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-4 text-center">
        Demo: customer@shopguard.dev / Test123! | admin@shopguard.dev / Admin123!
      </p>
    </div>
  );
}
