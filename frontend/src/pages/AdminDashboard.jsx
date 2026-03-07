import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import { FiPackage, FiUsers, FiShoppingBag, FiDollarSign } from 'react-icons/fi';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([
                    API.get('/admin/dashboard'),
                    API.get('/admin/orders?page=0&size=10'),
                ]);
                setStats(statsRes.data);
                setOrders(ordersRes.data.content || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <div className="loader" style={{ marginTop: 120 }}><div className="loader__spinner"></div></div>;

    const statCards = [
        { icon: <FiShoppingBag />, label: 'Products', value: stats?.totalProducts || 0, color: 'var(--primary)' },
        { icon: <FiUsers />, label: 'Customers', value: stats?.totalUsers || 0, color: 'var(--accent-blue)' },
        { icon: <FiPackage />, label: 'Orders', value: stats?.totalOrders || 0, color: 'var(--accent-orange)' },
        { icon: <FiDollarSign />, label: 'Revenue', value: `$${stats?.totalRevenue || 0}`, color: 'var(--success)' },
    ];

    return (
        <div className="admin-layout" id="admin-dashboard">
            <aside className="admin-sidebar">
                <div style={{ padding: '0 var(--space-6)', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>🌿 FreshAI</h2>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>Admin Panel</p>
                </div>
                {[
                    { icon: <FiPackage />, label: 'Dashboard', active: true },
                    { icon: <FiShoppingBag />, label: 'Products' },
                    { icon: <FiPackage />, label: 'Orders' },
                    { icon: <FiUsers />, label: 'Customers' },
                ].map((item, i) => (
                    <a key={i} className={`admin-sidebar__link ${item.active ? 'admin-sidebar__link--active' : ''}`} href="#">
                        {item.icon} {item.label}
                    </a>
                ))}
            </aside>

            <main className="admin-content">
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
                <p style={{ color: 'var(--gray-400)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>Welcome back, Admin</p>

                <div className="admin-stats-grid">
                    {statCards.map((stat, i) => (
                        <motion.div className="admin-stat-card" key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                            <div style={{ width: 36, height: 36, background: `${stat.color}12`, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: 'var(--text-lg)' }}>
                                {stat.icon}
                            </div>
                            <div className="admin-stat-card__value">{stat.value}</div>
                            <div className="admin-stat-card__label">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 'var(--space-6)', border: '1px solid var(--gray-100)' }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                >
                    <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Recent Orders</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                {['Order #', 'Amount', 'Status', 'Date'].map(h => (
                                    <th key={h} style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--gray-400)', textAlign: 'left', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid var(--gray-50)' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{order.orderNumber}</td>
                                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>${order.totalAmount}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span className={`tag ${order.status === 'DELIVERED' ? 'tag--green' : order.status === 'CANCELLED' ? 'tag--red' : 'tag--orange'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', color: 'var(--gray-400)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--gray-400)' }}>No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
            </main>
        </div>
    );
}
