
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, type Product } from "./services/api";

const emptyForm = {
  sku: "",
  name: "",
  description: "",
  unit: "pcs",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        (product.description ?? "").toLowerCase().includes(term),
    );
  }, [products, search]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

try {
  const payload = {
    sku: form.sku.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    unit: form.unit.trim(),
  };

  if (editingId !== null) {
    await api.updateProduct(editingId, payload);
    setSuccess("Product updated successfully.");
  } else {
    await api.createProduct(payload);
    setSuccess("Product created successfully.");
  }

  setForm(emptyForm);
  setEditingId(null);
  setShowForm(false);
  await loadProducts();
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : "Unable to save product.",
  );
} finally {
  setSaving(false);
}
  }

  function openNewProductForm() {
   
    setError("");
    setSuccess("");
    setForm(emptyForm);
    setShowForm(true);
    setEditingId(null);
  }

  function handleEdit(product: Product) {
  setError("");
  setSuccess("");
  setEditingId(product.id);
  setForm({
    sku: product.sku,
    name: product.name,
    description: product.description ?? "",
    unit: product.unit,
  });
  setShowForm(true);
}

  return (
    <section className="products-page">
      <div className="products-heading">
        <div>
          <h1>Products</h1>
          <p>Manage your inventory product catalogue.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openNewProductForm}
        >
          + Add Product
        </button>
      </div>

      <div className="products-summary">
        <div className="products-summary-card">
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="products-summary-card">
          <span>Active products</span>
          <strong>{products.filter((p) => p.active).length}</strong>
        </div>
      </div>

      {error && <div className="products-error">{error}</div>}
      {success && <div className="products-success">{success}</div>}

      {showForm && (
        <form className="products-form" onSubmit={handleSubmit}>
        <h2>{editingId !== null ? "Edit product" : "Add a product"}</h2>
          <div className="products-form-grid">
            <label>
              SKU *
              <input
                value={form.sku}
                onChange={(e) =>
                  setForm({ ...form, sku: e.target.value })
                }
                maxLength={80}
                required
                placeholder="e.g. GLASS-002"
              />
            </label>

            <label>
              Product name *
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                maxLength={180}
                required
                placeholder="Enter product name"
              />
            </label>

            <label>
              Unit *
              <input
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
                maxLength={30}
                required
                placeholder="e.g. pcs, sheet, kg"
              />
            </label>

            <label className="products-description">
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional product description"
                rows={3}
              />
            </label>
          </div>

          <p className="products-hint">
            Initial stock is not entered here. Inventory stock is managed
            through the receiving workflow.
          </p>

          <div className="products-form-actions">
            <button
              type="button"
              className="secondary-button"
            onClick={() => {
  setShowForm(false);
  setEditingId(null);
}}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
             {saving
  ? "Saving..."
  : editingId !== null
    ? "Update Product"
    : "Save Product"}
            </button>
          </div>
        </form>
      )}

      <div className="products-table-card">
        <div className="products-table-heading">
          <h2>Product catalogue</h2>
          <input
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
          />
        </div>

        {loading ? (
          <p className="products-message">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="products-message">
            {products.length === 0
              ? "No products found. Add your first product."
              : "No products match your search."}
          </p>
        ) : (
          <div className="products-table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Current stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.description || "—"}</td>
                    <td>{product.unit}</td>
                    <td>{product.currentStock}</td>
                    <td>
                      <span
                        className={
                          product.active
                            ? "products-status-active"
                            : "products-status-inactive"
                        }
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
  <button
    type="button"
    className="secondary-button"
    onClick={() => handleEdit(product)}
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
