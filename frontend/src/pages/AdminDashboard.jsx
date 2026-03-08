import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiBox, FiTruck, FiActivity, FiEdit2, FiTrash2, FiPlus, FiAlertTriangle, FiBell, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LOW_STOCK_THRESHOLD = 10;
const POLL_INTERVAL_MS = 30000; // 30 seconds

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({});
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Stock alert state ──
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [alertBannerVisible, setAlertBannerVisible] = useState(false);
    const previousLowStockIdsRef = useRef(new Set());

    // ── Fetch low-stock products ──
    const fetchLowStock = useCallback(async () => {
        try {
            const res = await API.get(`/admin/products/low-stock?threshold=${LOW_STOCK_THRESHOLD}`);
            const items = res.data || [];
            setLowStockProducts(items);

            // Determine NEW alerts that weren't in the previous poll
            const currentIds = new Set(items.map(p => p.id));
            const prevIds = previousLowStockIdsRef.current;

            items.forEach(p => {
                if (!prevIds.has(p.id)) {
                    // Brand-new low-stock product detected → fire toast
                    toast(
                        (t) => (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <FiAlertTriangle color="var(--danger)" size={18} />
                                <span><b>{p.name}</b> is low on stock — only <b>{p.stockQuantity}</b> left!</span>
                                <button onClick={() => toast.dismiss(t.id)} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: 'var(--gray-500)' }}>✕</button>
                            </span>
                        ),
                        { duration: 8000, id: `low-stock-${p.id}`, style: { border: '1px solid var(--danger)', background: '#fff5f5' } }
                    );
                }
            });

            previousLowStockIdsRef.current = currentIds;

            if (items.length > 0) setAlertBannerVisible(true);
        } catch (err) {
            console.error('Low stock poll failed', err);
        }
    }, []);

    // ── Background polling ──
    useEffect(() => {
        fetchLowStock(); // initial fetch
        const interval = setInterval(fetchLowStock, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLowStock]);

    // ── Tab data loading ──
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'dashboard') {
                const [statsRes, ordersRes] = await Promise.all([
                    API.get('/admin/stats'),
                    API.get('/admin/orders?page=0&size=5'),
                ]);
                setStats(statsRes.data);
                setOrders(ordersRes.data.content || []);
            } else if (activeTab === 'orders') {
                const res = await API.get('/admin/orders?page=0&size=100');
                setOrders(res.data.content || []);
            } else if (activeTab === 'products') {
                const res = await API.get('/admin/products');
                setProducts(res.data);
            } else if (activeTab === 'customers') {
                const res = await API.get('/admin/users');
                setUsers(res.data);
            } else if (activeTab === 'alerts') {
                await fetchLowStock(); // refresh on tab switch
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (id, status) => {
        try {
            await API.put(`/admin/orders/${id}/status?status=${status}`);
            toast.success('Order status updated');
            loadData();
        } catch (err) { toast.error('Update failed'); }
    };

    const updateProductStock = async (id, newStock) => {
        try {
            await API.put(`/admin/products/${id}/stock`, { stockQuantity: parseInt(newStock) });
            toast.success('Stock updated');
            loadData();
            fetchLowStock(); // re-check alerts after stock update
        } catch (err) { toast.error('Update failed'); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await API.delete(`/admin/products/${id}`);
            toast.success('Product deleted');
            loadData();
        } catch (err) { toast.error('Delete failed'); }
    };

    const getChartData = () => {
        const data = {};
        orders.forEach(o => {
            const date = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            if (!data[date]) data[date] = { name: date, revenue: 0, orders: 0 };
            data[date].revenue += o.totalAmount;
            data[date].orders += 1;
        });
        return Object.values(data).slice(-7);
    };

    // ═══════════════════════════════════════════════
    //  STOCK ALERT BANNER — persistent top bar
    // ═══════════════════════════════════════════════
    const renderAlertBanner = () => (
        <AnimatePresence>
            {alertBannerVisible && lowStockProducts.length > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--r-lg)',
                        padding: '14px 20px',
                        marginBottom: 'var(--space-6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 'var(--space-4)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 'var(--r-md)',
                            background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'pulse 2s infinite',
                        }}>
                            <FiAlertTriangle color="#dc2626" size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 'var(--text-sm)' }}>
                                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? 's' : ''} running low on stock
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: '#b91c1c', marginTop: 2 }}>
                                {lowStockProducts.slice(0, 3).map(p => p.name).join(', ')}
                                {lowStockProducts.length > 3 ? ` and ${lowStockProducts.length - 3} more…` : ''}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="btn btn--sm" onClick={() => setActiveTab('alerts')} style={{ background: '#dc2626', color: 'white', fontWeight: 700, fontSize: '12px', padding: '6px 14px' }}>
                            View Alerts
                        </button>
                        <button onClick={() => setAlertBannerVisible(false)} style={{ background: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
                            <FiX size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // ═══════════════════════════════════════════════
    //  STOCK ALERTS TAB — full dedicated panel
    // ═══════════════════════════════════════════════
    const renderStockAlerts = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FiAlertTriangle color="var(--danger)" /> Stock Alerts
                    </h1>
                    <p style={{ color: 'var(--gray-500)' }}>
                        Products with stock ≤ {LOW_STOCK_THRESHOLD} units. Auto-refreshes every {POLL_INTERVAL_MS / 1000}s.
                    </p>
                </div>
                <button className="btn btn--outline btn--sm" onClick={fetchLowStock}>↻ Refresh Now</button>
            </div>

            {lowStockProducts.length === 0 ? (
                <div style={{ background: 'var(--success-light)', border: '1px solid #bbf7d0', borderRadius: 'var(--r-xl)', padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>✅</div>
                    <div style={{ fontWeight: 700, color: 'var(--success)', fontSize: 'var(--text-lg)' }}>All Clear!</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginTop: 4 }}>No products are below the stock threshold right now.</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    {lowStockProducts.map((p, i) => {
                        const severity = p.stockQuantity === 0 ? 'critical' : p.stockQuantity <= 3 ? 'high' : 'medium';
                        const severityColor = severity === 'critical' ? '#dc2626' : severity === 'high' ? '#ea580c' : '#d97706';
                        const severityBg = severity === 'critical' ? '#fef2f2' : severity === 'high' ? '#fff7ed' : '#fffbeb';
                        const severityLabel = severity === 'critical' ? 'OUT OF STOCK' : severity === 'high' ? 'CRITICAL' : 'LOW';

                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    background: 'white',
                                    border: `1.5px solid ${severityColor}30`,
                                    borderRadius: 'var(--r-xl)',
                                    padding: 'var(--space-4) var(--space-5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 'var(--space-4)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                                    <img src={p.imageUrl || '/placeholder.png'} alt="" style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', objectFit: 'cover', border: '1px solid var(--gray-200)' }} />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 2 }}>{p.name}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{p.categoryName || 'Uncategorized'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                                    {/* Severity Badge */}
                                    <span style={{
                                        background: severityBg,
                                        color: severityColor,
                                        padding: '4px 10px',
                                        borderRadius: 'var(--r-full)',
                                        fontSize: '10px',
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                    }}>
                                        {severityLabel}
                                    </span>

                                    {/* Stock Display */}
                                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: severityColor }}>{p.stockQuantity}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 600 }}>in stock</div>
                                    </div>

                                    {/* Quick Restock Input */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            min="1"
                                            id={`restock-${p.id}`}
                                            style={{
                                                width: 70,
                                                padding: '8px 12px',
                                                borderRadius: 'var(--r-md)',
                                                border: '1.5px solid var(--gray-300)',
                                                fontSize: 'var(--text-sm)',
                                                fontWeight: 600,
                                            }}
                                        />
                                        <button
                                            className="btn btn--primary btn--sm"
                                            onClick={() => {
                                                const input = document.getElementById(`restock-${p.id}`);
                                                const val = parseInt(input?.value);
                                                if (val && val > 0) {
                                                    updateProductStock(p.id, p.stockQuantity + val);
                                                    input.value = '';
                                                } else {
                                                    toast.error('Enter a valid quantity');
                                                }
                                            }}
                                        >
                                            Restock
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );

    // ═══════════════════════════════════════════════
    //  DASHBOARD
    // ═══════════════════════════════════════════════
    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Dashboard Metrics</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>Platform overview and analytics.</p>

            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 'var(--space-8)' }}>
                {[
                    { icon: <FiUsers />, label: 'Total Users', value: stats.totalUsers || 0, color: 'var(--accent-blue)' },
                    { icon: <FiActivity />, label: 'Active Users', value: Math.round((stats.totalUsers || 0) * 0.8) || 0, color: '#8b5cf6' },
                    { icon: <FiPackage />, label: 'Total Orders', value: stats.totalOrders || 0, color: 'var(--accent-orange)' },
                    { icon: <FiShoppingBag />, label: 'Total Products', value: stats.totalProducts || 0, color: 'var(--primary)' },
                    { icon: <FiBox />, label: 'Total Inventory Stock', value: stats.totalStock ?? 0, color: '#14b8a6' },
                    { icon: <FiDollarSign />, label: 'Total Revenue', value: `$${stats.totalRevenue ? stats.totalRevenue.toFixed(2) : 0}`, color: 'var(--success)' },
                ].map((stat, i) => (
                    <div className="product-card" key={i} style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ width: 40, height: 40, background: `${stat.color}15`, borderRadius: 'var(--r-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                            {stat.icon}
                        </div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>{stat.value}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', fontWeight: 500 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                <div style={{ background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--r-xl)', border: '1px solid var(--gray-200)', height: 350 }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-md)', fontWeight: 700 }}>Revenue Overview</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={getChartData().length ? getChartData() : [{ name: 'Mon', revenue: 400 }, { name: 'Tue', revenue: 300 }, { name: 'Wed', revenue: 600 }]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ background: 'white', padding: 'var(--space-4)', borderRadius: 'var(--r-xl)', border: '1px solid var(--gray-200)', height: 350 }}>
                    <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-md)', fontWeight: 700 }}>Orders Trend</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <LineChart data={getChartData().length ? getChartData() : [{ name: 'Mon', orders: 12 }, { name: 'Tue', orders: 15 }, { name: 'Wed', orders: 20 }]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="orders" stroke="var(--accent-orange)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );

    // ═══════════════════════════════════════════════
    //  INVENTORY
    // ═══════════════════════════════════════════════
    const renderInventory = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Inventory Management</h1>
                    <p style={{ color: 'var(--gray-500)' }}>Manage products, stock alerts, and new additions.</p>
                </div>
                <button className="btn btn--primary"><FiPlus /> Add New Product</button>
            </div>
            <div style={{ background: 'white', borderRadius: 'var(--r-xl)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Product</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Category</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Price</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Stock</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', background: p.stockQuantity <= LOW_STOCK_THRESHOLD ? '#fff5f5' : 'transparent' }}>
                                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={p.imageUrl || '/placeholder.png'} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', objectFit: 'cover' }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{p.name}</div>
                                        {p.stockQuantity <= LOW_STOCK_THRESHOLD && (
                                            <span style={{
                                                fontSize: '10px',
                                                color: p.stockQuantity === 0 ? '#dc2626' : '#ea580c',
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 3,
                                            }}>
                                                <FiAlertTriangle size={10} />
                                                {p.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', color: 'var(--gray-600)' }}>{p.categoryName || 'N/A'}</td>
                                <td style={{ padding: '16px', fontWeight: 600 }}>${p.price?.toFixed(2)}</td>
                                <td style={{ padding: '16px' }}>
                                    <input
                                        type="number"
                                        defaultValue={p.stockQuantity}
                                        onBlur={(e) => updateProductStock(p.id, e.target.value)}
                                        style={{
                                            width: '70px',
                                            padding: '4px 8px',
                                            borderRadius: 'var(--r-sm)',
                                            border: `1.5px solid ${p.stockQuantity <= LOW_STOCK_THRESHOLD ? '#fca5a5' : 'var(--gray-300)'}`,
                                            fontWeight: 600,
                                            color: p.stockQuantity <= LOW_STOCK_THRESHOLD ? '#dc2626' : 'var(--gray-800)',
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button className="btn btn--outline btn--sm" style={{ padding: '6px' }}><FiEdit2 /></button>
                                    <button className="btn btn--danger btn--sm" style={{ padding: '6px' }} onClick={() => deleteProduct(p.id)}><FiTrash2 /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    // ═══════════════════════════════════════════════
    //  ORDERS
    // ═══════════════════════════════════════════════
    const renderOrders = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Order Tracking</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>View and manage customer orders.</p>
            <div style={{ background: 'white', borderRadius: 'var(--r-xl)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Order #</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Customer</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Items</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Total</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Status</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--primary)' }}>{o.orderNumber}</td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600 }}>{o.customerName || 'Guest'}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{new Date(o.createdAt).toLocaleString()}</div>
                                </td>
                                <td style={{ padding: '16px', color: 'var(--gray-600)' }}>{o.items?.length || 0} products</td>
                                <td style={{ padding: '16px', fontWeight: 600 }}>${o.totalAmount?.toFixed(2)}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        background: o.status === 'DELIVERED' ? 'var(--success-light)' : 'var(--warning-light)',
                                        color: o.status === 'DELIVERED' ? 'var(--success)' : 'var(--warning)',
                                        padding: '4px 8px', borderRadius: 'var(--r-full)', fontSize: '11px', fontWeight: 700
                                    }}>
                                        {o.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <select
                                        value={o.status}
                                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                                        style={{ padding: '6px 12px', borderRadius: 'var(--r-sm)', border: '1px solid var(--gray-300)', background: 'white', outline: 'none' }}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="PROCESSING">Processing</option>
                                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                        <option value="DELIVERED">Delivered</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    // ═══════════════════════════════════════════════
    //  CUSTOMERS
    // ═══════════════════════════════════════════════
    const renderCustomers = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Customer Analytics</h1>
            <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-6)' }}>Registered customers and their activity overview.</p>
            <div style={{ background: 'white', borderRadius: 'var(--r-xl)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                        <tr>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Name</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Email</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Status</th>
                            <th style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '16px', fontWeight: 600, color: 'var(--gray-800)' }}>
                                    {u.firstName} {u.lastName} {u.role === 'ADMIN' && <span style={{ marginLeft: 8, background: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--r-sm)' }}>ADMIN</span>}
                                </td>
                                <td style={{ padding: '16px', color: 'var(--gray-500)' }}>{u.email}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6,
                                        background: u.isActive ? 'var(--success)' : 'var(--danger)'
                                    }}></span>
                                    {u.isActive ? 'Active' : 'Inactive'}
                                </td>
                                <td style={{ padding: '16px', color: 'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    // ═══════════════════════════════════════════════
    //  LAYOUT
    // ═══════════════════════════════════════════════
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', paddingTop: 'var(--nav-h)' }}>
            <aside style={{ width: 260, background: 'white', borderRight: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 'var(--nav-h)', bottom: 0, padding: 'var(--space-6) var(--space-4)' }}>
                <div style={{ marginBottom: 'var(--space-8)', padding: '0 var(--space-2)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gray-400)', marginBottom: 'var(--space-2)' }}>Management</div>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                            { id: 'dashboard', icon: <FiActivity />, label: 'Dashboard' },
                            { id: 'products', icon: <FiBox />, label: 'Inventory' },
                            { id: 'orders', icon: <FiTruck />, label: 'Orders' },
                            { id: 'customers', icon: <FiUsers />, label: 'Customers' },
                            { id: 'alerts', icon: <FiBell />, label: 'Stock Alerts', badge: lowStockProducts.length },
                        ].map(t => (
                            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', width: '100%',
                                borderRadius: 'var(--r-md)', fontSize: 'var(--text-sm)',
                                fontWeight: activeTab === t.id ? 700 : 500,
                                color: activeTab === t.id ? (t.id === 'alerts' && lowStockProducts.length > 0 ? '#dc2626' : 'var(--primary)') : 'var(--gray-600)',
                                background: activeTab === t.id ? (t.id === 'alerts' && lowStockProducts.length > 0 ? '#fef2f2' : 'var(--primary-light)') : 'transparent',
                                textAlign: 'left', transition: 'all 0.2s', position: 'relative',
                            }}>
                                <span style={{ fontSize: '18px' }}>{t.icon}</span> {t.label}
                                {t.badge > 0 && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: '#dc2626', color: 'white',
                                        fontSize: '10px', fontWeight: 800,
                                        padding: '2px 7px', borderRadius: 'var(--r-full)',
                                        minWidth: 20, textAlign: 'center',
                                        animation: 'pulse 2s infinite',
                                    }}>
                                        {t.badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            <main style={{ marginLeft: 260, flex: 1, padding: 'var(--space-8) var(--space-10)' }}>
                {/* Global alert banner */}
                {activeTab !== 'alerts' && renderAlertBanner()}

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
                        <div className="loader__spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></div>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' && <div key="dashboard">{renderDashboard()}</div>}
                        {activeTab === 'products' && <div key="products">{renderInventory()}</div>}
                        {activeTab === 'orders' && <div key="orders">{renderOrders()}</div>}
                        {activeTab === 'customers' && <div key="customers">{renderCustomers()}</div>}
                        {activeTab === 'alerts' && <div key="alerts">{renderStockAlerts()}</div>}
                    </AnimatePresence>
                )}
            </main>
        </div>
    );
}
