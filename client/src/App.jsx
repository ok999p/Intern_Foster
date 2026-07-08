import { useEffect, useState } from 'react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from './api';
import ProductForm from './components/ProductForm';

const Icon = {
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Pencil: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  ),
  Box: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 8v8a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16V8a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4A2 2 0 0 1 21 8Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  ),
  Alert: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  ),
};

const CATEGORY_STYLES = {
  1: 'bg-blue-50 text-blue-700 ring-blue-200',
  2: 'bg-purple-50 text-purple-700 ring-purple-200',
  3: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  4: 'bg-slate-100 text-slate-600 ring-slate-200',
};
function categoryBadge(id) {
  return CATEGORY_STYLES[id] || 'bg-slate-100 text-slate-600 ring-slate-200';
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  function handleEdit(product) {
    setEditing(product);
    setShowForm(true);
  }

  async function handleSubmit(payload) {
    if (editing) {
      await updateProduct(editing.id, payload);
    } else {
      await createProduct(payload);
    }
    setShowForm(false);
    setEditing(null);
    await loadData();
  }

  async function handleDelete(product) {
    if (!window.confirm(`ต้องการลบสินค้า "${product.name}" (${product.id}) ใช่หรือไม่?`)) {
      return;
    }
    try {
      await deleteProduct(product.id);
      await loadData();
    } catch (err) {
      alert('ลบไม่สำเร็จ: ' + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-blue-500/25">
              <Icon.Box className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">จัดการสินค้า</h1>
              <p className="text-sm text-slate-500">Product CRUD · เชื่อมต่อ Supabase</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:from-indigo-600 hover:to-blue-600 active:scale-[0.98]"
          >
            <Icon.Plus className="h-4 w-4" />
            เพิ่มสินค้า
          </button>
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <Icon.Alert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-700">รายการสินค้า</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {products.length} รายการ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3">รหัสสินค้า</th>
                  <th className="px-5 py-3">ชื่อ</th>
                  <th className="px-5 py-3 text-right">ราคา</th>
                  <th className="px-5 py-3">หมวดหมู่</th>
                  <th className="px-5 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
                        กำลังโหลด...
                      </span>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Icon.Box className="h-10 w-10" />
                        <p className="text-sm">ยังไม่มีสินค้า — กด “เพิ่มสินค้า” เพื่อเริ่มต้น</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-3.5 font-mono text-sm text-slate-500">{p.id}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{p.name}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                        ฿{Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryBadge(
                            p.category_id
                          )}`}
                        >
                          {p.category_name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200 transition hover:bg-amber-100"
                          >
                            <Icon.Pencil className="h-3.5 w-3.5" />
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-100"
                          >
                            <Icon.Trash className="h-3.5 w-3.5" />
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          React + Tailwind · Express REST API · Supabase (PostgreSQL)
        </p>
      </div>

      {showForm && (
        <ProductForm
          editing={editing}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
