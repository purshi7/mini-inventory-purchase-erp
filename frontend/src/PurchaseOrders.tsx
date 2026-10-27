
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import type {
  CreatePurchaseOrder,
  Product,
  PurchaseOrder,
  Vendor,
} from "./services/api";

type OrderLine = {
  productId: string;
  quantity: string;
  unitPrice: string;
};

const emptyLine: OrderLine = {
  productId: "",
  quantity: "1",
  unitPrice: "0.01",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([{ ...emptyLine }]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orderData, vendorData, productData] = await Promise.all([
        api.getPurchaseOrders(),
        api.getVendors(),
        api.getProducts(),
      ]);

      setOrders(orderData);
      setVendors(vendorData);
      setProducts(productData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load purchase orders.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const quantity = Number(line.quantity);
        const price = Number(line.unitPrice);

        return sum +
          (quantity > 0 && price > 0 ? quantity * price : 0);
      }, 0),
    [lines],
  );

  function updateLine(
    index: number,
    field: keyof OrderLine,
    value: string,
  ) {
    setLines((current) =>
      current.map((line, i) =>
        i === index ? { ...line, [field]: value } : line,
      ),
    );
  }

  function resetForm() {
    setVendorId("");
    setNotes("");
    setLines([{ ...emptyLine }]);
    setShowForm(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!vendorId) {
      setError("Please select a vendor.");
      return;
    }

    if (lines.some(
      (line) =>
        !line.productId ||
        !Number.isFinite(Number(line.quantity)) ||
        Number(line.quantity) < 0.01 ||
        !Number.isFinite(Number(line.unitPrice)) ||
        Number(line.unitPrice) < 0.01,
    )) {
      setError(
        "Select a product and enter a quantity and unit price of at least 0.01 for every item.",
      );
      return;
    }

    if (new Set(lines.map((line) => line.productId)).size !== lines.length) {
      setError("Each product can appear only once. Update its quantity instead.");
      return;
    }

    const payload: CreatePurchaseOrder = {
      vendorId: Number(vendorId),
      notes: notes.trim() || undefined,
      items: lines.map((line) => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
      })),
    };

    setSaving(true);

    try {
      const created = await api.createPurchaseOrder(payload);
      setSuccess(`Purchase order ${created.orderNumber} created successfully.`);
      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create purchase order.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="products-page">
      <div className="products-heading">
        <div>
          <h1>Purchase Orders</h1>
          <p>Create and track orders placed with your vendors.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm((current) => !current);
          }}
        >
          {showForm ? "Close Form" : "+ New Purchase Order"}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {showForm && (
        <form className="products-form" onSubmit={handleSubmit}>
          <h2>Create Purchase Order</h2>

          <label>
            Vendor *
            <select
              value={vendorId}
              onChange={(event) => setVendorId(event.target.value)}
              required
            >
              <option value="">Select vendor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              placeholder="Optional order notes"
            />
          </label>

          <h3>Order Items</h3>

          {lines.map((line, index) => (
            <div className="purchase-order-line" key={index}>
              <label>
                Product *
                <select
                  value={line.productId}
                  onChange={(event) =>
                    updateLine(index, "productId", event.target.value)
                  }
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} — {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Quantity *
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={line.quantity}
                  onChange={(event) =>
                    updateLine(index, "quantity", event.target.value)
                  }
                  required
                />
              </label>

              <label>
                Unit Price (₹) *
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={line.unitPrice}
                  onChange={(event) =>
                    updateLine(index, "unitPrice", event.target.value)
                  }
                  required
                />
              </label>

              <div className="purchase-order-line-total">
                <span>Line Total</span>
                <strong>
                  {money(
                    Math.max(0, Number(line.quantity) || 0) *
                    Math.max(0, Number(line.unitPrice) || 0),
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="secondary-button"
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((current) => current.filter((_, i) => i !== index))
                }
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="secondary-button"
            onClick={() => setLines((current) => [...current, { ...emptyLine }])}
          >
            + Add Item
          </button>

          <div className="purchase-order-total">
            <span>Order Total</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="products-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={saving || vendors.length === 0 || products.length === 0}
            >
              {saving ? "Saving..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      )}

      <div className="products-table-card">
        <h2>Purchase Order History</h2>

        {loading ? (
          <p>Loading purchase orders...</p>
        ) : orders.length === 0 ? (
          <p>No purchase orders found. Create your first order above.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Vendor</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.vendorName}</td>
                    <td>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>{order.items?.length ?? 0}</td>
                    <td>{money(Number(order.totalAmount) || 0)}</td>
                    <td>
                      <span className="status-badge">{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
