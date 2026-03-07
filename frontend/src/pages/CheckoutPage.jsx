import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiClock, FiArrowRight } from 'react-icons/fi';

export default function CheckoutPage() {
    const { cart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ address: '', notes: '', paymentMethod: 'CARD' });
    const [selectedSlot, setSelectedSlot] = useState(0);

    const deliveryFee = cart.totalAmount >= 25 ? 0 : 2.99;
    const total = (parseFloat(cart.totalAmount || 0) + deliveryFee).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.address.trim()) { toast.error('Please enter delivery address'); return; }
        setLoading(true);
        try {
            const res = await createOrder({ deliveryAddress: form.address, paymentMethod: form.paymentMethod, notes: form.notes });
            toast.success('Order placed! 🎉');
            navigate('/order-success', { state: { order: res.data } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally { setLoading(false); }
    };

    const slots = ['10:00 AM – 12:00 PM', '2:00 PM – 4:00 PM', '6:00 PM – 8:00 PM'];
    const paymentMethods = [
        { id: 'CARD', icon: '💳', label: 'Credit Card' },
        { id: 'UPI', icon: '📱', label: 'UPI' },
        { id: 'COD', icon: '💵', label: 'Cash on Delivery' },
    ];

    return (
        <motion.div className="checkout-page" id="checkout-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Checkout</h1>
            <p style={{ color: 'var(--gray-400)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
                Complete your order in a few steps
            </p>

            <form onSubmit={handleSubmit}>
                <div className="checkout-page__layout">
                    <div>
                        {/* Address */}
                        <motion.div className="checkout-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                            <h3 className="checkout-section__title"><FiMapPin color="var(--primary)" size={18} /> Delivery Address</h3>
                            <textarea className="form-input" rows={3} placeholder="Enter your full delivery address..."
                                value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                id="address-input" required />
                        </motion.div>

                        {/* Delivery Slot */}
                        <motion.div className="checkout-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                            <h3 className="checkout-section__title"><FiClock color="var(--primary)" size={18} /> Delivery Slot</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                                {slots.map((slot, i) => (
                                    <motion.button
                                        key={i} type="button"
                                        className={`btn ${i === selectedSlot ? 'btn--primary' : 'btn--secondary'} btn--sm`}
                                        onClick={() => setSelectedSlot(i)}
                                        whileTap={{ scale: 0.96 }}
                                        style={{ fontSize: 'var(--text-xs)' }}
                                    >
                                        {slot}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Payment */}
                        <motion.div className="checkout-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
                            <h3 className="checkout-section__title"><FiCreditCard color="var(--primary)" size={18} /> Payment Method</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                {paymentMethods.map(method => (
                                    <label key={method.id} style={{
                                        flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                                        padding: 'var(--space-3) var(--space-4)',
                                        border: `1.5px solid ${form.paymentMethod === method.id ? 'var(--primary)' : 'var(--gray-200)'}`,
                                        borderRadius: 'var(--r-lg)', cursor: 'pointer',
                                        background: form.paymentMethod === method.id ? 'var(--primary-lighter)' : 'white',
                                        transition: 'all 200ms ease',
                                    }}>
                                        <input type="radio" name="payment" checked={form.paymentMethod === method.id}
                                            onChange={() => setForm({ ...form, paymentMethod: method.id })} style={{ accentColor: 'var(--primary)', width: 15, height: 15 }} />
                                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{method.icon} {method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </motion.div>

                        {/* Notes */}
                        <motion.div className="checkout-section" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                            <h3 className="checkout-section__title">📝 Notes <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: 'var(--text-xs)' }}>(Optional)</span></h3>
                            <textarea className="form-input" rows={2} placeholder="Special instructions..."
                                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </motion.div>
                    </div>

                    {/* Summary */}
                    <motion.div className="cart-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <h3 className="cart-summary__title">Order Summary</h3>
                        {cart.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                                <span style={{ maxWidth: '65%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName} × {item.quantity}</span>
                                <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>${item.totalPrice?.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="cart-summary__row" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--gray-100)' }}>
                            <span>Subtotal</span><span style={{ fontWeight: 600 }}>${parseFloat(cart.totalAmount || 0).toFixed(2)}</span>
                        </div>
                        <div className="cart-summary__row">
                            <span>Delivery</span>
                            <span style={{ color: deliveryFee === 0 ? 'var(--primary)' : 'var(--gray-800)', fontWeight: 600 }}>
                                {deliveryFee === 0 ? 'FREE' : `$${deliveryFee}`}
                            </span>
                        </div>
                        <div className="cart-summary__row cart-summary__row--total">
                            <span>Total</span><span>${total}</span>
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn--primary btn--lg btn--full"
                            style={{ marginTop: 'var(--space-5)' }}
                            disabled={loading}
                            id="place-order-btn"
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Processing...' : `Place Order — $${total}`}
                            {!loading && <FiArrowRight />}
                        </motion.button>
                    </motion.div>
                </div>
            </form>
        </motion.div>
    );
}
