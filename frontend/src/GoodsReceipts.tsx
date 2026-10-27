
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./services/api";
import type {
  CreateGoodsReceipt,
  GoodsReceiptResult,
  PurchaseOrder,
} from "./services/api";

type ReceiptLine = {
  purchaseOrderItemId: number;
  productName: string;
  orderedQuantity: number;
  previouslyReceived: number;
  receivedNow: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);

export default function GoodsReceipts() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<GoodsReceiptResult | null>(null);

  // Keep the same key when retrying a failed submission.
  const [idempotencyKey, setIdempotencyKey] = useState(
    () => crypto.randomUUID(),
  );

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getPurchaseOrders();
      setOrders(data);
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
    void loadOrders();
  }, [loadOrders]);

  const selectedOrder = useMemo(
    () => orders.find((order) => String(order.id) === purchaseOrderId),
    [orders, purchaseOrderId],
  );

  function selectOrder(value: string) {
    setPurchaseOrderId(value);
    setError("");
    setSuccess(null);
    setNotes("");

    const order = orders.find((item) => String(item.id) === value);

    setLines(
      order
        ? order.items.map((item) => ({
            purchaseOrderItemId: item.id,
            productName: item.productName,
            orderedQuantity: Number(item.orderedQuantity),
            previouslyReceived: Number(item.receivedQuantity),
            receivedNow: "",
          }))
        : [],
    );
  }

  function updateReceivedQuantity(
    purchaseOrderItemId: number,
    value: string,
  ) {
    setLines((current) =>
      current.map((line) =>
        line.purchaseOrderItemId === purchaseOrderItemId
          ? { ...line, receivedNow: value }
          : line,
      ),
    );
  }

  const totalReceived = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + Math.max(0, Number(line.receivedNow) || 0),
        0,
      ),
    [lines],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(null);

    if (!selectedOrder) {
      setError("Please select a purchase order.");
      return;
    }

    if (selectedOrder.status === "CANCELLED") {
      setError("Goods cannot be received for a cancelled purchase order.");
      return;
    }

    const enteredLines = lines.filter(
      (line) => line.receivedNow.trim() !== "",
    );

    if (enteredLines.length === 0) {
      setError("Enter a received quantity for at least one item.");
      return;
    }

    for (const line of enteredLines) {
      const quantity = Number(line.receivedNow);
      const remaining =
        line.orderedQuantity - line.previouslyReceived;

      if (!Number.isFinite(quantity) || quantity < 0.01) {
        setError("Every entered quantity must be at least 0.01.");
        return;
      }

      if (quantity > remaining + 0.000001) {
        setError(
          `${line.productName}: only ${remaining} remaining to receive.`,
        );
        return;
      }
    }

    const payload: CreateGoodsReceipt = {
      purchaseOrderId: selectedOrder.id,
      idempotencyKey,
      notes: notes.trim() || undefined,
      items: enteredLines.map((line) => ({
        purchaseOrderItemId: line.purchaseOrderItemId,
        receivedQuantity: Number(line.receivedNow),
      })),
    };

    setSaving(true);

    try {
      const result = await api.createGoodsReceipt(payload);
      setSuccess(result);

      // Reload orders so the latest received quantities and statuses appear.
      await loadOrders();

      setPurchaseOrderId("");
      setLines([]);
      setNotes("");
      setIdempotencyKey(crypto.randomUUID());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record goods receipt. You can retry this submission.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="products-page goods-receipts-page">
      <div className="products-heading">
        <div>
          <h1>Goods Receipts</h1>
          <p>Record delivered items and update inventory stock.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => void loadOrders()}
          disabled={loading || saving}
        >
          Refresh Orders
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {success && (
        <div className="alert-success">
          {success.message}. Receipt number: <strong>{success.receiptNumber}</strong>
        </div>
      )}

      <form className="products-form" onSubmit={handleSubmit}>
        <h2>Record Goods Receipt</h2>

        {loading ? (
          <p>Loading purchase orders...</p>
        ) : (
          <>
            <label>
              Purchase Order *
              <select
                value={purchaseOrderId}
                onChange={(event) => selectOrder(event.target.value)}
                required
                disabled={saving}
              >
                <option value="">Select purchase order</option>
                {orders
                  .filter((order) => order.status !== "CANCELLED")
                  .map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} — {order.vendorName} — {order.status}
                    </option>
                  ))}
              </select>
            </label>

            {selectedOrder && (
              <>
                <div className="receipt-order-summary">
                  <div>
                    <span>Vendor</span>
                    <strong>{selectedOrder.vendorName}</strong>
                  </div>
                  <div>
                    <span>Order Total</span>
                    <strong>{money(Number(selectedOrder.totalAmount) || 0)}</strong>
                  </div>
                  <div>
                    <span>Order Status</span>
                    <strong>{selectedOrder.status}</strong>
                  </div>
                </div>

                <h3>Items to Receive</h3>

                <div className="products-table-wrapper">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Ordered</th>
                        <th>Previously Received</th>
                        <th>Remaining</th>
                        <th>Receive Now</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => {
                        const remaining = Math.max(
                          0,
                          line.orderedQuantity - line.previouslyReceived,
                        );

                        return (
                          <tr key={line.purchaseOrderItemId}>
                            <td>{line.productName}</td>
                            <td>{line.orderedQuantity}</td>
                            <td>{line.previouslyReceived}</td>
                            <td>{remaining}</td>
                            <td>
                              <input
                                className="receipt-quantity-input"
                                type="number"
                                min="0.01"
                                max={remaining}
                                step="any"
                                placeholder="0"
                                value={line.receivedNow}
                                disabled={saving || remaining <= 0}
                                onChange={(event) =>
                                  updateReceivedQuantity(
                                    line.purchaseOrderItemId,
                                    event.target.value,
                                  )
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <label>
                  Receipt Notes
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Optional delivery notes"
                    disabled={saving}
                  />
                </label>

                <div className="purchase-order-total">
                  <span>Total Units Received Now</span>
                  <strong>{totalReceived}</strong>
                </div>

                <div className="products-form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={saving}
                    onClick={() => selectOrder("")}
                  >
                    Clear
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      saving ||
                      selectedOrder.status === "CANCELLED" ||
                      lines.every(
                        (line) =>
                          line.orderedQuantity - line.previouslyReceived <= 0,
                      )
                    }
                  >
                    {saving ? "Recording..." : "Record Goods Receipt"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </form>
    </section>
  );
}
