
import { useCallback, useEffect, useState } from "react";
import "./styles.css";
import {
  api,
  type Vendor,
  type VendorPayment,
  type VendorOutstanding,
} from "./services/api";
import Products from "./Products";
import Vendors from "./Vendors";
import PurchaseOrders from "./PurchaseOrders";
import GoodsReceipts from "./GoodsReceipts";
import Dashboard from "./Dashboard";
import OutstandingReport from "./OutstandingReport";

type Page =
  | "Dashboard"
  | "Vendors"
  | "Products"
  | "Purchase Orders"
  | "Goods Receipts"
  | "Vendor Payments"
  | "Outstanding Report";

const pages: Page[] = [
  "Dashboard",
  "Vendors",
  "Products",
  "Purchase Orders",
  "Goods Receipts",
  "Vendor Payments",
  "Outstanding Report",
];

const today = () => new Date().toLocaleDateString("en-CA");

const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);

function App() {
  const [activePage, setActivePage] = useState<Page>("Vendor Payments");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [outstanding, setOutstanding] = useState<VendorOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [vendorId, setVendorId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(today());
  const [method, setMethod] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [vendorData, paymentData, outstandingData] = await Promise.all([
        api.getVendors(),
        api.getPayments(),
        api.getOutstanding(),
      ]);

      setVendors(vendorData);
      setPayments(paymentData);
      setOutstanding(outstandingData);

      if (vendorData.length > 0) {
        setVendorId((current) =>
          current && vendorData.some((vendor) => String(vendor.id) === current)
            ? current
            : String(vendorData[0].id),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load ERP data. Check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedOutstanding = outstanding.find(
    (item) => String(item.vendorId) === vendorId,
  );

  const totalPurchases = outstanding.reduce(
    (sum, item) => sum + item.totalPurchaseAmount,
    0,
  );
  const totalPaid = outstanding.reduce((sum, item) => sum + item.totalPaid, 0);
  const totalOutstanding = outstanding.reduce(
    (sum, item) => sum + item.outstandingAmount,
    0,
  );

  async function handlePaymentSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsedAmount = Number(amount);

    if (!vendorId) {
      setError("Please select a vendor.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }

    if (
      selectedOutstanding &&
      parsedAmount > selectedOutstanding.outstandingAmount
    ) {
      setError(
        `Payment exceeds the current outstanding balance of ${money(
          selectedOutstanding.outstandingAmount,
        )}.`,
      );
      return;
    }

    setSaving(true);

    try {
      const payment: Parameters<typeof api.createPayment>[0] = {
        vendorId: Number(vendorId),
        idempotencyKey: crypto.randomUUID(),
        amount: parsedAmount,
        paymentDate,
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await api.createPayment(payment);

      setSuccess("Payment recorded successfully.");
      setAmount("");
      setReferenceNumber("");
      setNotes("");

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">B</div>
          <div>
            <h2>Boomax</h2>
            <span>Inventory ERP</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          {pages.map((page) => (
            <button
              key={page}
              className={`nav-item ${activePage === page ? "active" : ""}`}
              onClick={() => setActivePage(page)}
            >
              <span className="nav-dot" />
              {page}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">P</div>
          <div>
            <strong>Administrator</strong>
            <span>ERP Workspace</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / {activePage}</span>
            <h1>{activePage}</h1>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Inventory ERP
          </div>
        </header>

        <section className="page-content">
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status">
              {success}
            </div>
          )}

          {loading ? (
            <div className="content-card">
              <p>Loading data from the backend...</p>
            </div>
          ) : activePage === "Vendor Payments" ? (
            <>
              <div className="welcome-row">
                <div>
                  <h2>Vendor Payments</h2>
                  <p>Record supplier payments and monitor balances.</p>
                </div>
                <button className="secondary-button" onClick={() => void loadData()}>
                  Refresh data
                </button>
              </div>

              <div className="summary-grid">
                <article className="summary-card">
                  <span>Total purchases</span>
                  <strong>{money(totalPurchases)}</strong>
                  <small>Non-cancelled purchase orders</small>
                </article>
                <article className="summary-card">
                  <span>Total paid</span>
                  <strong>{money(totalPaid)}</strong>
                  <small>Recorded vendor payments</small>
                </article>
                <article className="summary-card">
                  <span>Outstanding</span>
                  <strong>{money(totalOutstanding)}</strong>
                  <small>Estimated vendor balances</small>
                </article>
              </div>

              <div className="content-card">
                <div className="card-heading">
                  <div>
                    <h3>Record a payment</h3>
                    <p>Enter the payment details below.</p>
                  </div>
                </div>

                <form className="payment-form" onSubmit={handlePaymentSubmit}>
                  <label>
                    Vendor *
                    <select
                      required
                      value={vendorId}
                      onChange={(event) => setVendorId(event.target.value)}
                    >
                      <option value="">Select vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name} (ID: {vendor.id})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Amount (₹) *
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Enter payment amount"
                    />
                    {selectedOutstanding && (
                      <small className="field-hint">
                        Outstanding: {money(selectedOutstanding.outstandingAmount)}
                      </small>
                    )}
                  </label>

                  <label>
                    Payment date *
                    <input
                      required
                      type="date"
                      value={paymentDate}
                      onChange={(event) => setPaymentDate(event.target.value)}
                    />
                  </label>

                  <label>
                    Payment method *
                    <select
                      value={method}
                      onChange={(event) => setMethod(event.target.value)}
                    >
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank transfer</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </label>

                  <label>
                    Reference number
                    <input
                      value={referenceNumber}
                      onChange={(event) => setReferenceNumber(event.target.value)}
                      maxLength={100}
                      placeholder="UPI / bank transaction reference"
                    />
                  </label>

                  <label>
                    Notes
                    <input
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Optional notes"
                    />
                  </label>

                  <div className="form-actions">
                    <button
                      className="primary-button"
                      type="submit"
                      disabled={saving || vendors.length === 0}
                    >
                      {saving ? "Saving payment..." : "Record payment"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="content-card">
                <div className="card-heading">
                  <div>
                    <h3>Payment history</h3>
                    <p>Payments retrieved from the backend.</p>
                  </div>
                  <span className="table-count">
                    {payments.length} payments
                  </span>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>REFERENCE</th>
                        <th>VENDOR</th>
                        <th>DATE</th>
                        <th>METHOD</th>
                        <th className="amount">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            {payment.referenceNumber || payment.idempotencyKey}
                          </td>
                          <td>{payment.vendorName}</td>
                          <td>{payment.paymentDate}</td>
                         <td>{payment.method.replace(/_/g, " ")}</td>
                          <td className="amount">{money(payment.amount)}</td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={5}>No payments recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
       ) : activePage === "Products" ? (
  <Products />
) : activePage === "Vendors" ? (
  <Vendors />
  
) : activePage === "Purchase Orders" ? (
  <PurchaseOrders />
  ) : activePage === "Goods Receipts" ? (
  <GoodsReceipts />
  ) : activePage === "Dashboard" ? (
  <Dashboard />
  ) : activePage === "Outstanding Report" ? (
  <OutstandingReport />
) : (
  <div className="content-card placeholder-page">
    <div className="empty-icon">B</div>
    <h2>{activePage}</h2>
    <p>This screen will be implemented next.</p>
    <button
      className="primary-button"
      onClick={() => setActivePage("Vendor Payments")}
    >
      Open Vendor Payments
    </button>
  </div>
)}
        </section>
      </main>
    </div>
  );
}

export default App;
