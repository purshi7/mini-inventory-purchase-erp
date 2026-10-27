
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type Vendor, type CreateVendor } from "./services/api";

const emptyForm: CreateVendor = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CreateVendor>({ ...emptyForm });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getVendors();
      setVendors(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load vendors.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVendors();
  }, [loadVendors]);

  const filteredVendors = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return vendors;

    return vendors.filter((vendor) =>
      [
        vendor.name,
        vendor.email ?? "",
        vendor.phone ?? "",
        vendor.address ?? "",
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [vendors, search]);

  function openNewVendorForm() {
    setError("");
    setSuccess("");
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
  }

  function handleEdit(vendor: Vendor) {
    setError("");
    setSuccess("");
    setEditingId(vendor.id);
    setForm({
      name: vendor.name,
      email: vendor.email ?? "",
      phone: vendor.phone ?? "",
      address: vendor.address ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload: CreateVendor = {
      name: form.name.trim(),
      email: form.email?.trim() || undefined,
      phone: form.phone?.trim() || undefined,
      address: form.address?.trim() || undefined,
    };

    try {
      if (editingId !== null) {
        await api.updateVendor(editingId, payload);
        setSuccess("Vendor updated successfully.");
      } else {
        await api.createVendor(payload);
        setSuccess("Vendor created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      await loadVendors();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save vendor.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="products-page">
      <div className="products-heading">
        <div>
          <h2>Vendors</h2>
          <p>Manage supplier contact information.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openNewVendorForm}
        >
          + Add Vendor
        </button>
      </div>

      <div className="products-summary">
        <div className="products-summary-card">
          <span>Total vendors</span>
          <strong>{vendors.length}</strong>
        </div>
        <div className="products-summary-card">
          <span>Active vendors</span>
          <strong>{vendors.filter((vendor) => vendor.active).length}</strong>
        </div>
      </div>

      {error && <div className="products-error" role="alert">{error}</div>}
      {success && <div className="products-success" role="status">{success}</div>}

      {showForm && (
        <form className="products-form" onSubmit={handleSubmit}>
          <h3>{editingId !== null ? "Edit vendor" : "Add a vendor"}</h3>

          <div className="products-form-grid">
            <label>
              Vendor name *
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter vendor name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                maxLength={254}
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="vendor@example.com"
              />
            </label>

            <label>
              Phone
              <input
                type="tel"
                maxLength={40}
                value={form.phone ?? ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Contact number"
              />
            </label>

            <label className="products-description">
              Address
              <textarea
                rows={3}
                value={form.address ?? ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Vendor address"
              />
            </label>
          </div>

          <div className="products-form-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={saving}
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Vendor"
                  : "Save Vendor"}
            </button>
          </div>
        </form>
      )}

      <div className="products-table-card">
        <div className="products-table-heading">
          <h3>Vendor directory</h3>
          <input
            aria-label="Search vendors"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="products-message">Loading vendors...</p>
        ) : filteredVendors.length === 0 ? (
          <p className="products-message">
            {vendors.length === 0
              ? "No vendors found. Add your first vendor."
              : "No vendors match your search."}
          </p>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.email || "—"}</td>
                    <td>{vendor.phone || "—"}</td>
                    <td>{vendor.address || "—"}</td>
                    <td>
                      <span
                        className={
                          vendor.active
                            ? "products-status-active"
                            : "products-status-inactive"
                        }
                      >
                        {vendor.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEdit(vendor)}
                      >
                        Edit
                      </button>
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
