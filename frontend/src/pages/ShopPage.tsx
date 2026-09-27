import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function ShopPage() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.list,
  });
  const { addItem } = useCart();

  if (isLoading) return <div data-testid="loading">Loading products...</div>;
  if (error) return <div className="text-red-600">Failed to load products</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" data-testid="shop-title">Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((p) => (
          <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" data-testid={`product-card-${p.id}`}>
            <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover bg-gray-100" />
            <div className="p-4">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-brand-700" data-testid={`product-price-${p.id}`}>
                  ${p.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">{p.stock} in stock</span>
              </div>
              <button
                onClick={() => addItem(p)}
                disabled={p.stock === 0}
                className="mt-3 w-full bg-brand-600 text-white py-2 rounded-md hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                data-testid={`add-to-cart-${p.id}`}
              >
                {p.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
