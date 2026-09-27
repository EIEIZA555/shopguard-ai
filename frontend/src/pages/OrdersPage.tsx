import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "../lib/api";

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
  });

  if (isLoading) return <div data-testid="orders-loading">Loading orders...</div>;

  return (
    <div data-testid="orders-page">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {!orders?.length ? (
        <p className="text-gray-400" data-testid="no-orders">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white p-4 rounded-lg border" data-testid={`order-${o.id}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Order #{o.id}</span>
                <span className={`text-sm px-2 py-0.5 rounded-full ${o.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {o.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{new Date(o.created_at).toLocaleString()}</p>
              <ul className="mt-2 text-sm">
                {o.items.map((item, i) => (
                  <li key={i}>{item.product_name} x{item.quantity} — ${item.unit_price.toFixed(2)}</li>
                ))}
              </ul>
              <p className="mt-2 font-bold" data-testid={`order-total-${o.id}`}>Total: ${o.total_amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
