import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import {
  FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiBox, FiTruck,
  FiActivity, FiEdit2, FiTrash2, FiPlus, FiAlertTriangle, FiBell,
  FiX, FiSave, FiChevronDown, FiToggleLeft, FiToggleRight, FiRefreshCw,
  FiSearch, FiFilter, FiEye, FiEyeOff,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const LOW_STOCK_THRESHOLD = 10;
const POLL_INTERVAL_MS = 60000;

const BLANK_FORM = {
  name: '', description: '', price: '', discountPrice: '', unit: '',
  stockQuantity: '', imageUrl: '', categoryId: '', isOrganic: false,
  isFeatured: false, isActive: true, origin: '', weight: '',
};

/* ─── shared inline styles ─── */
const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const inp = {
  width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
  fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827',
  background: 'white', transition: 'border-color 0.2s',
};

// ── safely extract array from various API shapes ─────────────────
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.data?.content && Array.isArray(data.data.content)) return data.data.content;
  return [];
};

// ── safely extract object stats ──────────────────────────────────
const extractStats = (data) => {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // unwrap nested .data if present
    if ('totalProducts' in data) return data;
    if (data.data && typeof data.data === 'object') return data.data;
  }
  return {};
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats]       = useState({});
  const [orders, setOrders]     = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  /* ── Product form ── */
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(BLANK_FORM);
  const [editId, setEditId]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Stock alerts ── */
  const [lowStockProducts, setLowStockProducts]       = useState([]);
  const [alertBannerVisible, setAlertBannerVisible]   = useState(false);
  const prevLowStockIds = useRef(new Set());

  /* ─────────────────────────── helpers ─────────────────────────── */
  const fetchLowStock = useCallback(async () => {
    try {
      const res = await API.get(`/admin/products/low-stock?threshold=${LOW_STOCK_THRESHOLD}`);
      const items = extractArray(res.data);
      setLowStockProducts(items);
      const currentIds = new Set(items.map(p => p.id));
      items.forEach(p => {
        if (!prevLowStockIds.current.has(p.id))
          toast.error(`⚠️ ${p.name} is low on stock — only ${p.stockQuantity} left!`,
            { id: `low-${p.id}`, duration: 7000 });
      });
      prevLowStockIds.current = currentIds;
      if (items.length > 0) setAlertBannerVisible(true);
    } catch { /* silent */ }
  }, []);

  /* fetch categories (always needed for product form) */
  useEffect(() => {
    API.get('/products/categories')
      .then(r => setCategories(extractArray(r.data)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLowStock();
    const t = setInterval(fetchLowStock, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchLowStock]);

  useEffect(() => { loadData(); }, [activeTab]); // eslint-disable-line

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const [sRes, oRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/orders?page=0&size=5'),
        ]);
        setStats(extractStats(sRes.data));
        setOrders(extractArray(oRes.data));

      } else if (activeTab === 'orders') {
        const res = await API.get('/admin/orders?page=0&size=100');
        setOrders(extractArray(res.data));

      } else if (activeTab === 'products') {
        const res = await API.get('/admin/products');
        setProducts(extractArray(res.data));

      } else if (activeTab === 'customers') {
        const res = await API.get('/admin/users');
        setUsers(extractArray(res.data));

      } else if (activeTab === 'alerts') {
        await fetchLowStock();
      }
    } catch (err) {
      console.error('AdminDashboard loadData error:', err);
      toast.error(err.userMessage || 'Failed to load data — check backend is running');
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────── product CRUD ─────────────────────── */
  const openAddForm = () => {
    setForm(BLANK_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setForm({
      name:          p.name          || '',
      description:   p.description   || '',
      price:         p.price         || '',
      discountPrice: p.discountPrice || '',
      unit:          p.unit          || '',
      stockQuantity: p.stockQuantity ?? '',
      imageUrl:      p.imageUrl      || '',
      categoryId:    p.categoryId    || '',
      isOrganic:     p.isOrganic     || false,
      isFeatured:    p.isFeatured    || false,
      isActive:      p.isActive      ?? true,
      origin:        p.origin        || '',
      weight:        p.weight        || '',
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())   { toast.error('Product name is required');   return; }
    if (!form.price)          { toast.error('Price is required');          return; }
    if (form.stockQuantity === '') { toast.error('Stock quantity is required'); return; }
    if (!form.categoryId)    { toast.error('Please select a category');   return; }

    const payload = {
      ...form,
      price:         parseFloat(form.price),
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      stockQuantity: parseInt(form.stockQuantity, 10),
      categoryId:    parseInt(form.categoryId, 10),
      weight:        form.weight ? parseFloat(form.weight) : null,
    };

    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/admin/products/${editId}`, payload);
        toast.success('✅ Product updated!');
      } else {
        await API.post('/admin/products', payload);
        toast.success('✅ Product added!');
      }
      setShowForm(false);
      setForm(BLANK_FORM);
      setEditId(null);
      if (activeTab === 'products') loadData();
    } catch (err) {
      toast.error(err.userMessage || 'Save failed — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return;
    try {
      await API.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      loadData();
    } catch { toast.error('Delete failed'); }
  };

  const toggleProductStatus = async (p) => {
    const payload = { ...p, isActive: !p.isActive, categoryId: p.categoryId };
    try {
      await API.put(`/admin/products/${p.id}`, payload);
      toast.success(`Product ${!p.isActive ? 'activated' : 'deactivated'}`);
      loadData();
    } catch { toast.error('Status update failed'); }
  };

  const updateStockInline = async (id, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return;
    try {
      await API.put(`/admin/products/${id}/stock`, { stockQuantity: n });
      toast.success('Stock updated');
      loadData();
      fetchLowStock();
    } catch { toast.error('Stock update failed'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await API.put(`/admin/orders/${id}/status?status=${status}`);
      toast.success('Order updated');
      loadData();
    } catch { toast.error('Update failed'); }
  };

  const toggleUserStatus = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/status`);
      toast.success('User status updated');
      loadData();
    } catch { toast.error('Update failed'); }
  };

  const chartData = () => {
    const map = {};
    (orders || []).forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!map[d]) map[d] = { name: d, revenue: 0, orders: 0 };
      map[d].revenue += o.totalAmount || 0;
      map[d].orders  += 1;
    });
    return Object.values(map).slice(-7);
  };

  /* ─── filtered product list ─────────────────────────────────── */
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  /* ══════════════════════════ RENDERERS ══════════════════════════ */

  const renderAlertBanner = () => (
    <AnimatePresence>
      {alertBannerVisible && lowStockProducts.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FiAlertTriangle color="#dc2626" size={20} />
            <div>
              <div style={{ fontWeight: 700, color: '#991b1b' }}>{lowStockProducts.length} product(s) running low</div>
              <div style={{ fontSize: 12, color: '#b91c1c' }}>
                {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                {lowStockProducts.length > 3 ? ` +${lowStockProducts.length - 3} more` : ''}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--sm" onClick={() => setActiveTab('alerts')}
              style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>
              View Alerts
            </button>
            <button onClick={() => setAlertBannerVisible(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>
              <FiX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── Product Form Modal ── */
  const renderProductForm = () => (
    <AnimatePresence>
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditId(null); } }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', overflow: 'auto', padding: 36, boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
                  {editId ? '✏️ Edit Product' : '➕ Add New Product'}
                </h2>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
                  {editId ? 'Update the product details below' : 'Fill in the details to add a new product to inventory'}
                </p>
              </div>
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#374151', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={lbl}>Product Name *</label>
                <input style={inp} placeholder="e.g. Amul Gold Milk 1L"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>

              {/* Description */}
              <div>
                <label style={lbl}>Description</label>
                <textarea rows={3} style={{ ...inp, resize: 'vertical' }}
                  placeholder="Brief product description…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* Price + Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Price (₹) *</label>
                  <input style={inp} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div>
                  <label style={lbl}>Discount Price (₹)</label>
                  <input style={inp} type="number" min="0" step="0.01" placeholder="Optional (leave blank for no discount)"
                    value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} />
                </div>
              </div>

              {/* Unit + Stock + Weight */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Unit</label>
                  <input style={inp} placeholder="e.g. 1 kg, 500 ml"
                    value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
                </div>
                <div>
                  <label style={lbl}>Stock Quantity *</label>
                  <input style={inp} type="number" min="0" placeholder="0"
                    value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} required />
                </div>
                <div>
                  <label style={lbl}>Weight (kg)</label>
                  <input style={inp} type="number" min="0" step="0.01" placeholder="e.g. 0.5"
                    value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={lbl}>Category *</label>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inp, appearance: 'none', paddingRight: 40 }}
                    value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                    <option value="">Select a category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <FiChevronDown style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }} />
                </div>
              </div>

              {/* Origin */}
              <div>
                <label style={lbl}>Origin / Source</label>
                <input style={inp} placeholder="e.g. Gujarat, India"
                  value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} />
              </div>

              {/* Image URL */}
              <div>
                <label style={lbl}>Image URL</label>
                <input style={inp} type="url" placeholder="https://images.unsplash.com/…"
                  value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display = 'none'}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '2px solid #e5e7eb' }} />
                )}
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  ['isOrganic', '🌿 Organic'],
                  ['isFeatured', '⭐ Featured'],
                  ['isActive', '✅ Active (visible to customers)'],
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#374151' }}>
                    <input type="checkbox" checked={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary, #16a34a)' }} />
                    {label}
                  </label>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                <button type="submit" disabled={submitting}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', background: 'var(--primary, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                  <FiSave size={16} />
                  {submitting ? 'Saving…' : (editId ? 'Update Product' : 'Add Product')}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setEditId(null); }}
                  style={{ padding: '12px 24px', background: 'white', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── Dashboard ── */
  const renderDashboard = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Welcome back, {user?.firstName || 'Admin'} 👋</p>
        </div>
        <button onClick={loadData}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151' }}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: <FiUsers />,      label: 'Total Users',    value: stats.totalUsers    ?? 0,                               color: '#3b82f6' },
          { icon: <FiActivity />,   label: 'Active Users',   value: stats.activeUsers   ?? 0,                               color: '#8b5cf6' },
          { icon: <FiPackage />,    label: 'Total Orders',   value: stats.totalOrders   ?? 0,                               color: '#f59e0b' },
          { icon: <FiShoppingBag />,label: 'Products',       value: stats.totalProducts ?? 0,                               color: 'var(--primary, #16a34a)' },
          { icon: <FiBox />,        label: 'Total Stock',    value: stats.totalStock    ?? 0,                               color: '#14b8a6' },
          { icon: <FiDollarSign />, label: 'Revenue',        value: `₹${((stats.totalRevenue ?? 0)).toFixed(2)}`,           color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 40, height: 40, background: `${s.color}18`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: 20, marginBottom: 12 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {[
          { title: 'Revenue (Last 7 Days)', key: 'revenue', color: 'var(--primary, #16a34a)', chart: BarChart,   component: Bar  },
          { title: 'Order Trend',           key: 'orders',  color: '#f59e0b',                 chart: LineChart,  component: Line },
        ].map(({ title, key, color, chart: Chart, component: Comp }) => (
          <div key={key} style={{ background: 'white', padding: 24, borderRadius: 16, border: '1px solid #e5e7eb', height: 320 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, margin: '0 0 16px' }}>{title}</h3>
            <ResponsiveContainer width="100%" height="85%">
              <Chart data={chartData().length ? chartData() : [{ name: '—', [key]: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                {key === 'revenue'
                  ? <Bar dataKey="revenue" fill={color} radius={[4, 4, 0, 0]} />
                  : <Line type="monotone" dataKey="orders" stroke={color} strokeWidth={3} dot={{ r: 4 }} />}
              </Chart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </motion.div>
  );

  /* ── Inventory (Products Tab) ── */
  const renderInventory = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>Inventory</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>
            {filteredProducts.length} of {products.length} product(s)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              style={{ ...inp, paddingLeft: 34, width: 220 }}
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={loadData}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
            <FiRefreshCw size={14} />
          </button>
          <button onClick={openAddForm}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--primary, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            <FiPlus /> Add New Product
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: 'white', borderRadius: 16, border: '2px dashed #e5e7eb' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontWeight: 700, color: '#374151', fontSize: 20 }}>
            {products.length === 0 ? 'No products yet' : 'No products match your search'}
          </h3>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>
            {products.length === 0 ? 'Click "Add New Product" to add your first product to inventory.' : 'Try a different search term.'}
          </p>
          {products.length === 0 && (
            <button onClick={openAddForm}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--primary, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
              <FiPlus /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Visible', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: !p.isActive ? '#fafafa' : p.stockQuantity <= LOW_STOCK_THRESHOLD ? '#fff5f5' : 'white',
                  opacity: p.isActive ? 1 : 0.65,
                }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={p.imageUrl || 'https://placehold.co/48x48?text=?'}
                        alt="" onError={e => { e.target.src = 'https://placehold.co/48x48?text=?'; }}
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #e5e7eb' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.unit} {p.origin ? `· ${p.origin}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>
                    <span style={{ background: '#f3f4f6', padding: '3px 10px', borderRadius: 99, fontWeight: 500 }}>
                      {p.categoryName || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>₹{Number(p.price || 0).toFixed(2)}</div>
                    {p.discountPrice && (
                      <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Sale: ₹{Number(p.discountPrice).toFixed(2)}</div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <input
                      type="number" defaultValue={p.stockQuantity} min="0"
                      onBlur={e => { if (parseInt(e.target.value) !== p.stockQuantity) updateStockInline(p.id, e.target.value); }}
                      style={{
                        width: 72, padding: '6px 10px', borderRadius: 8,
                        border: `1.5px solid ${p.stockQuantity <= LOW_STOCK_THRESHOLD ? '#fca5a5' : '#d1d5db'}`,
                        fontWeight: 600, fontSize: 14,
                        color: p.stockQuantity <= LOW_STOCK_THRESHOLD ? '#dc2626' : '#111827',
                      }}
                    />
                    {p.stockQuantity <= LOW_STOCK_THRESHOLD && (
                      <div style={{ fontSize: 10, marginTop: 2, color: p.stockQuantity === 0 ? '#dc2626' : '#ea580c', fontWeight: 700 }}>
                        {p.stockQuantity === 0 ? '⛔ OUT' : '⚠️ LOW'}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: p.isActive ? '#dcfce7' : '#f3f4f6',
                      color: p.isActive ? '#16a34a' : '#9ca3af',
                    }}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button title={p.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleProductStatus(p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.isActive ? '#16a34a' : '#9ca3af', fontSize: 20 }}>
                      {p.isActive ? <FiEye /> : <FiEyeOff />}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button title="Edit" onClick={() => openEditForm(p)}
                        style={{ padding: '6px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: 8, cursor: 'pointer' }}>
                        <FiEdit2 size={14} />
                      </button>
                      <button title="Delete" onClick={() => deleteProduct(p.id, p.name)}
                        style={{ padding: '6px 10px', background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 8, cursor: 'pointer' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );

  /* ── Orders ── */
  const renderOrders = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>Orders</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>Manage and update customer orders</p>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Update Status'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders || []).map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary, #16a34a)' }}>{o.orderNumber}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{o.customerName || o.userEmail || 'Guest'}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(o.createdAt).toLocaleString()}</div>
                </td>
                <td style={{ padding: '14px 16px', color: '#6b7280' }}>{o.items?.length ?? 0}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700 }}>₹{Number(o.totalAmount || 0).toFixed(2)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                    background: o.status === 'DELIVERED' ? '#dcfce7' : o.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3',
                    color: o.status === 'DELIVERED' ? '#16a34a' : o.status === 'CANCELLED' ? '#dc2626' : '#92400e',
                  }}>
                    {o.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: 'white', cursor: 'pointer' }}>
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'].map(s =>
                      <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) &&
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>No orders yet</div>}
      </div>
    </motion.div>
  );

  /* ── Customers ── */
  const renderCustomers = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px' }}>Customers</h1>
      <p style={{ color: '#6b7280', marginBottom: 24 }}>{users.length} registered user(s)</p>
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              {['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users || []).map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{u.phone || '—'}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: u.role === 'ADMIN' ? '#ede9fe' : '#e0f2fe', color: u.role === 'ADMIN' ? '#6d28d9' : '#0369a1' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: u.isActive ? '#dcfce7' : '#fee2e2', color: u.isActive ? '#16a34a' : '#dc2626' }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#9ca3af', fontSize: 13 }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => toggleUserStatus(u.id)} title={u.isActive ? 'Deactivate' : 'Activate'}
                    style={{ padding: '6px 12px', background: u.isActive ? '#fee2e2' : '#dcfce7', color: u.isActive ? '#dc2626' : '#16a34a', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  /* ── Stock Alerts Tab ── */
  const renderStockAlerts = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiAlertTriangle color="#dc2626" /> Stock Alerts
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Products with ≤ {LOW_STOCK_THRESHOLD} units in stock</p>
        </div>
        <button onClick={fetchLowStock}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>
      {lowStockProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, background: '#f0fdf4', borderRadius: 16, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <h3 style={{ fontWeight: 700, color: '#16a34a', marginTop: 12 }}>All Clear!</h3>
          <p style={{ color: '#6b7280' }}>No products below the threshold right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {lowStockProducts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: 'white', border: '1.5px solid #fecaca', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img src={p.imageUrl || 'https://placehold.co/48x48?text=?'} alt=""
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.categoryName} · ₹{Number(p.price || 0).toFixed(2)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: p.stockQuantity === 0 ? '#dc2626' : '#ea580c' }}>{p.stockQuantity}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>in stock</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" placeholder="Add qty" min="1" id={`rs-${p.id}`}
                    style={{ width: 80, padding: '8px 10px', borderRadius: 8, border: '1px solid #d1d5db', fontWeight: 600 }} />
                  <button onClick={() => {
                    const el = document.getElementById(`rs-${p.id}`);
                    const v = parseInt(el.value);
                    if (v > 0) { updateStockInline(p.id, p.stockQuantity + v); el.value = ''; }
                    else toast.error('Enter a valid quantity');
                  }}
                    style={{ padding: '8px 16px', background: 'var(--primary, #16a34a)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                    Restock
                  </button>
                  <button onClick={() => openEditForm(p)}
                    style={{ padding: '8px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer' }}>
                    <FiEdit2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  /* ══════════════════════════ LAYOUT ══════════════════════════ */
  const navItems = [
    { id: 'dashboard', icon: <FiActivity />, label: 'Dashboard' },
    { id: 'products',  icon: <FiBox />,      label: 'Inventory' },
    { id: 'orders',    icon: <FiTruck />,    label: 'Orders' },
    { id: 'customers', icon: <FiUsers />,    label: 'Customers' },
    { id: 'alerts',    icon: <FiBell />,     label: 'Stock Alerts', badge: lowStockProducts.length },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb', paddingTop: 'var(--nav-h, 64px)' }}>
      {/* Product Form Modal */}
      {renderProductForm()}

      {/* Sidebar */}
      <aside style={{
        width: 260, background: 'white', borderRight: '1px solid #e5e7eb',
        position: 'fixed', left: 0, top: 'var(--nav-h, 64px)', bottom: 0,
        padding: '24px 12px', display: 'flex', flexDirection: 'column',
        zIndex: 100,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: '#9ca3af', textTransform: 'uppercase', padding: '0 12px', marginBottom: 12 }}>
          Admin Panel
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(t => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, fontSize: 14,
                fontWeight: active ? 700 : 500, color: active ? 'var(--primary, #16a34a)' : '#6b7280',
                background: active ? '#f0fdf4' : 'transparent', textAlign: 'left', position: 'relative',
                transition: 'all 0.15s', border: 'none', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                {t.label}
                {t.badge > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#dc2626', color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div style={{ marginTop: 'auto', padding: '16px 12px', borderTop: '1px solid #f3f4f6' }}>
          <button onClick={openAddForm}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: 'var(--primary, #16a34a)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            <FiPlus /> Add New Product
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 260, flex: 1, padding: '32px 40px', minWidth: 0 }}>
        {activeTab !== 'alerts' && renderAlertBanner()}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 120, gap: 16 }}>
            <div style={{
              width: 44, height: 44, border: '4px solid #e5e7eb',
              borderTop: '4px solid var(--primary, #16a34a)',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#6b7280', fontWeight: 500 }}>Loading data…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <div key="dashboard">{renderDashboard()}</div>}
            {activeTab === 'products'  && <div key="products">{renderInventory()}</div>}
            {activeTab === 'orders'    && <div key="orders">{renderOrders()}</div>}
            {activeTab === 'customers' && <div key="customers">{renderCustomers()}</div>}
            {activeTab === 'alerts'    && <div key="alerts">{renderStockAlerts()}</div>}
          </AnimatePresence>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
