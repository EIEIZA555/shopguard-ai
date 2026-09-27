const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  items: { product_id: number; product_name: string; quantity: number; unit_price: number }[];
  created_at: string;
}

export interface TestRun {
  id: number;
  pipeline_id: string;
  status: string;
  total_tests: number;
  passed: number;
  failed: number;
  flaky_score: number;
  duration_ms: number;
  created_at: string;
  failures: { id: number; test_name: string; error_message: string; ai_analysis: string; is_flaky: boolean }[];
}

export const productsApi = {
  list: () => api<Product[]>("/api/products"),
  get: (id: number) => api<Product>(`/api/products/${id}`),
};

export const authApi = {
  login: (email: string, password: string) =>
    api<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, full_name: string) =>
    api<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),
  me: () => api<User>("/api/auth/me"),
};

export const ordersApi = {
  checkout: (items: { product_id: number; quantity: number }[]) =>
    api<Order>("/api/orders/checkout", { method: "POST", body: JSON.stringify({ items }) }),
  list: () => api<Order[]>("/api/orders"),
};

export const testRunsApi = {
  list: () => api<TestRun[]>("/api/test-runs"),
  get: (id: number) => api<TestRun>(`/api/test-runs/${id}`),
};

export const aiApi = {
  analyze: (test_name: string, error_message: string, stack_trace = "") =>
    api<{ root_cause: string; suggested_fix: string; confidence: number }>("/api/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ test_name, error_message, stack_trace }),
    }),
};
