"use client";
import { useEffect, useState } from "react";
import { normalizeProductImage } from "../../lib/normalize-product-image";
import "./admin.css";

type Product = {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  stage: string;
  priceCents: number;
  unit: string;
  perUnit: string;
  badge: string | null;
  details: string;
  isHire: boolean;
  imageKey: string | null;
  stock: number | null;
  active: boolean;
};

const CATEGORIES = ["Nappies & wipes", "Feeding", "Food & snacks", "Clothing & shoes", "Prams & car seats"];
const STAGES = ["Newborn", "Infant", "Toddler", "All stages"];

const EMPTY_FORM = {
  sku: "",
  name: "",
  brand: "",
  category: CATEGORIES[0],
  stage: STAGES[0],
  price: "",
  unit: "",
  perUnit: "",
  badge: "",
  details: "",
  isHire: false,
  stock: "",
  imageKey: null as string | null,
};

function useAdminToken() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only read on mount
    setToken(sessionStorage.getItem("franklynsAdminToken"));
  }, []);
  function save(value: string) {
    sessionStorage.setItem("franklynsAdminToken", value);
    setToken(value);
  }
  function clear() {
    sessionStorage.removeItem("franklynsAdminToken");
    setToken(null);
  }
  return { token, save, clear };
}

export default function AdminPage() {
  const { token, save, clear } = useAdminToken();
  const [passwordInput, setPasswordInput] = useState("");

  if (token === null) {
    return (
      <div className="admin-gate">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput.trim()) save(passwordInput.trim());
          }}
        >
          <h1>Franklyn&apos;s admin</h1>
          <p>Enter the admin token to manage products.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Admin token"
            autoFocus
          />
          <button type="submit">Continue</button>
        </form>
      </div>
    );
  }

  return <AdminConsole token={token} onSignOut={clear} />;
}

function AdminConsole({ token, onSignOut }: { token: string; onSignOut: () => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function authedFetch(input: string, init: RequestInit = {}) {
    const res = await fetch(input, {
      ...init,
      headers: { ...(init.headers ?? {}), authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      onSignOut();
      throw new Error("Session expired. Sign in again.");
    }
    return res;
  }

  async function loadProducts() {
    setError("");
    try {
      const res = await authedFetch("/api/products?all=1");
      const data = (await res.json()) as { products?: Product[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't load products.");
      setProducts(data.products ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load products.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time fetch on mount
    loadProducts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  function openAddForm() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      category: product.category,
      stage: product.stage,
      price: (product.priceCents / 100).toString(),
      unit: product.unit,
      perUnit: product.perUnit,
      badge: product.badge ?? "",
      details: product.details,
      isHire: product.isHire,
      stock: product.stock === null ? "" : product.stock.toString(),
      imageKey: product.imageKey,
    });
    setShowForm(true);
  }

  async function handleImageChange(file: File) {
    setUploading(true);
    setError("");
    try {
      const framed = await normalizeProductImage(file);
      const body = new FormData();
      body.append("file", framed, "product.jpg");
      const res = await authedFetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { key?: string; error?: string };
      if (!res.ok || !data.key) throw new Error(data.error ?? "Upload failed.");
      setForm((f) => ({ ...f, imageKey: data.key! }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const priceCents = Math.round(Number(form.price) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setError("Enter a valid price.");
      setSaving(false);
      return;
    }
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      stage: form.stage,
      priceCents,
      unit: form.unit.trim(),
      perUnit: form.perUnit.trim(),
      badge: form.badge.trim() || null,
      details: form.details,
      isHire: form.isHire,
      stock: form.stock.trim() === "" ? null : Number(form.stock),
      imageKey: form.imageKey,
    };
    try {
      const res = editing
        ? await authedFetch(`/api/products/${editing.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await authedFetch("/api/products", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't save the product.");
      setShowForm(false);
      setNotice(editing ? "Product updated." : "Product added.");
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the product.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(product: Product) {
    setError("");
    try {
      const res = product.active
        ? await authedFetch(`/api/products/${product.id}`, { method: "DELETE" })
        : await authedFetch(`/api/products/${product.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ active: true }),
          });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Couldn't update the product.");
      setNotice(product.active ? "Product removed from sale." : "Product re-listed.");
      loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update the product.");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">FRANKLYN&apos;S · BUSINESS OPS</p>
          <h1>Product catalogue</h1>
        </div>
        <div className="admin-header-actions">
          <button className="admin-btn-primary" onClick={openAddForm}>
            Add product
          </button>
          <button className="admin-btn-ghost" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {notice && (
        <div className="admin-notice">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      {error && <div className="admin-error">{error}</div>}

      {products === null ? (
        <p className="admin-muted">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="admin-muted">No products yet. Add your first one to populate the storefront.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "" : "admin-row-inactive"}>
                <td>
                  {p.imageKey ? (
                    <img className="admin-thumb" src={`/api/images/${p.imageKey}`} alt={p.name} />
                  ) : (
                    <div className="admin-thumb admin-thumb-empty" />
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>£{(p.priceCents / 100).toFixed(2)}</td>
                <td>{p.stock === null ? "Untracked" : p.stock}</td>
                <td>
                  <span className={p.active ? "admin-status-active" : "admin-status-inactive"}>
                    {p.active ? "For sale" : "Removed"}
                  </span>
                </td>
                <td className="admin-row-actions">
                  <button onClick={() => openEditForm(p)}>Edit</button>
                  <button onClick={() => toggleActive(p)}>{p.active ? "Remove" : "Re-list"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="admin-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit product" : "Add product"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-image-upload">
                {form.imageKey ? (
                  <img src={`/api/images/${form.imageKey}`} alt="" />
                ) : (
                  <div className="admin-image-placeholder">No image</div>
                )}
                <label className="admin-btn-ghost">
                  {uploading ? "Uploading…" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(file);
                    }}
                  />
                </label>
                <small className="admin-image-hint">
                  Framed on a cream backdrop to match the catalogue automatically; any photo works.
                </small>
              </div>

              <div className="admin-field-grid">
                <label>
                  Name
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </label>
                <label>
                  SKU
                  <input required value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
                </label>
                <label>
                  Brand
                  <input required value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
                </label>
                <label>
                  Category
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Stage
                  <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}>
                    {STAGES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Price (£)
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />
                </label>
                <label>
                  Unit (e.g. &quot;48 pack · size 1&quot;)
                  <input required value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} />
                </label>
                <label>
                  Per-unit price (e.g. &quot;36p each&quot;)
                  <input required value={form.perUnit} onChange={(e) => setForm((f) => ({ ...f, perUnit: e.target.value }))} />
                </label>
                <label>
                  Badge (optional)
                  <input value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} />
                </label>
                <label>
                  Stock (blank = untracked)
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  />
                </label>
                <label className="admin-checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.isHire}
                    onChange={(e) => setForm((f) => ({ ...f, isHire: e.target.checked }))}
                  />
                  Hired monthly, not sold outright
                </label>
              </div>

              <label className="admin-details-field">
                Description
                <textarea
                  required
                  rows={3}
                  value={form.details}
                  onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
                />
              </label>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
