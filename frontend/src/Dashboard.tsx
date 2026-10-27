
import { useCallback, useEffect, useState } from "react";
import { api } from "./services/api";
import type {
  Product,
  PurchaseOrder,
  VendorOutstanding,
} from "./services/api";

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [outstanding, setOutstanding] = useState<VendorOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productData, orderData, outstandingData] = await Promise.all([
        api.getProducts(),
        api.getPurchaseOrders(),
        api.getOutstanding(),
      ]);

      setProducts(productData);
      setOrders(orderData);
      setOutstanding(outstandingData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const activeProducts = products.filter((product) => product.active);
  const lowStockProducts = activeProducts.filter(
    (product) => product.currentStock <= 5,
  );

  const activeOrders = orders.filter(
    (order) => order.status !== "CANCELLED",
  );

  const pendingOrders = activeOrders.filter(
    (order) => order.status !== "RECEIVED",
  );

  const purchaseValue = activeOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0,
  );

  const totalOutstanding = outstanding.reduce(
    (sum, item) => sum + Number(item.outstandingAmount || 0),
    0,
  );

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <h2>Business Overview</h2>
          <p>Monitor inventory, purchasing, and vendor balances.</p>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Dashboard"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="content-card">
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-cards">
            <article className="dashboard-card">
              <span>Active Products</span>
              <strong>{activeProducts.length}</strong>
              <small>{products.length} products in total</small>
            </article>

            <article className="dashboard-card">
              <span>Low Stock Items</span>
              <strong>{lowStockProducts.length}</strong>
              <small>Active products with stock of 5 or less</small>
            </article>

            <article className="dashboard-card">
              <span>Pending Purchase Orders</span>
              <strong>{pendingOrders.length}</strong>
              <small>Orders not yet fully received</small>
            </article>

            <article className="dashboard-card">
              <span>Purchase Value</span>
              <strong>{money(purchaseValue)}</strong>
              <small>Non-cancelled purchase orders</small>
            </article>

            <article className="dashboard-card">
              <span>Vendor Outstanding</span>
              <strong>{money(totalOutstanding)}</strong>
              <small>Unpaid vendor balance</small>
            </article>
          </div>

          <div className="content-card dashboard-table-card">
            <div className="card-heading">
              <div>
                <h3>Low Stock Products</h3>
                <p>Review items that may need replenishment.</p>
              </div>
              <span className="table-count">
                {lowStockProducts.length} items
              </span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>PRODUCT</th>
                    <th>UNIT</th>
                    <th>CURRENT STOCK</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.sku}</td>
                      <td>{product.name}</td>
                      <td>{product.unit}</td>
                      <td>
                        <span className="dashboard-stock-warning">
                          {product.currentStock}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {lowStockProducts.length === 0 && (
                    <tr>
                      <td colSpan={4}>No low-stock products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
