import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiShoppingBag, FiHome } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import { successPulse } from '../animations/variants';

export default function OrderSuccessPage() {
    const location = useLocation();
    const order = location.state?.order;

    return (
        <motion.div className="order-success" id="order-success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
                className="order-success__icon"
                variants={successPulse}
                initial="initial"
                animate="animate"
            >
                <FiCheck />
            </motion.div>

            <motion.h1
                style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                Order Placed! 🎉
            </motion.h1>
            <motion.p
                style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
                Thank you for shopping sustainably
            </motion.p>

            {order && (
                <motion.div
                    style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 'var(--space-5)', border: '1px solid var(--gray-100)', textAlign: 'left', marginBottom: 'var(--space-5)' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {[
                        { label: 'Order Number', value: order.orderNumber, color: 'var(--primary)' },
                        { label: 'Total', value: `$${order.totalAmount}`, color: 'var(--gray-900)' },
                        { label: 'Status', value: order.status, isTag: true },
                        { label: 'Items', value: `${order.items?.length || 0} products` },
                    ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--gray-50)' : 'none' }}>
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{row.label}</span>
                            {row.isTag ? (
                                <span className="tag tag--green">{row.value}</span>
                            ) : (
                                <span style={{ fontWeight: 700, color: row.color || 'var(--gray-800)', fontSize: 'var(--text-sm)' }}>{row.value}</span>
                            )}
                        </div>
                    ))}
                </motion.div>
            )}

            <motion.div
                className="order-success__eco-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <RiLeafLine color="var(--primary)" size={20} />
                    <strong style={{ color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>Your Eco Impact</strong>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0, lineHeight: 'var(--leading-relaxed)' }}>
                    You saved approximately <strong style={{ color: 'var(--primary)' }}>{order?.carbonSaved || '2.5'} kg CO₂</strong> with this order! 🌍
                </p>
            </motion.div>

            <motion.div
                style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            >
                <Link to="/" className="btn btn--primary btn--lg"><FiHome /> Home</Link>
                <Link to="/products" className="btn btn--secondary btn--lg"><FiShoppingBag /> Continue Shopping</Link>
            </motion.div>
        </motion.div>
    );
}
