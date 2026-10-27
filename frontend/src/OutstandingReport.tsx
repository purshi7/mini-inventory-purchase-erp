
import { useEffect, useState } from "react";
import { api, type VendorOutstanding } from "./services/api";

export default function OutstandingReport() {
  const [reports, setReports] = useState<VendorOutstanding[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getOutstanding()
      .then(setReports)
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load outstanding report"
        );
      });
  }, []);

  const totalPurchaseAmount = reports.reduce(
    (sum, report) => sum + report.totalPurchaseAmount, 0
  );

  const totalPaid = reports.reduce(
    (sum, report) => sum + report.totalPaid, 0
  );

  const totalOutstanding = reports.reduce(
    (sum, report) => sum + report.outstandingAmount, 0
  );

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

  return (
    <div className="products-page">
      <div className="products-heading">
        <div>
          <h1>Outstanding Report</h1>
          <p>Track vendor purchases, payments, and outstanding balances.</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Purchases</h3>
          <p>{formatCurrency(totalPurchaseAmount)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Paid</h3>
          <p>{formatCurrency(totalPaid)}</p>
        </div>

        <div className="dashboard-card">
          <h3>Total Outstanding</h3>
          <p>{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <div className="products-table-card">
        <table>
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Vendor Name</th>
              <th>Total Purchases</th>
              <th>Total Paid</th>
              <th>Outstanding</th>
            </tr>
          </thead>

          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={5}>No outstanding records found.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.vendorId}>
                  <td>{report.vendorId}</td>
                  <td>{report.vendorName}</td>
                  <td>{formatCurrency(report.totalPurchaseAmount)}</td>
                  <td>{formatCurrency(report.totalPaid)}</td>
                  <td>{formatCurrency(report.outstandingAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
