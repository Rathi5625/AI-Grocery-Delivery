import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { CartItemSkeleton } from '../components/ui/Skeletons';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function CartPage() {
    const { cart, loading, fetchCart, updateItem, removeItem } = useCart();

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const handleQty = async (itemId, newQty) => {
        try { await updateItem(itemId, newQty); }
        catch { toast.error('Failed to update'); }
    };

    const handleRemove = async (itemId) => {
        try { await removeItem(itemId); toast.success('Item removed'); }
        catch { toast.error('Failed to remove'); }
    };

    if (!loading && cart.items.length === 0) {
        return (
            <div className="cart-page">
                <motion.div className="empty-state" style={{ marginTop: 'var(--space-10)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="empty-state__icon">🛒</div>
                    <h3 className="empty-state__title">Your cart is empty</h3>
                    <p className="empty-state__text">Add some fresh, sustainable products</p>
                    <Link to="/products" className="btn btn--primary btn--lg"><FiShoppingBag /> Start Shopping</Link>
                </motion.div>
            </div>
        );
    }

    const deliveryFee = cart.totalAmount >= 25 ? 0 : 2.99;
    const total = (parseFloat(cart.totalAmount || 0) + deliveryFee).toFixed(2);

    return (
        <motion.div className="cart-page" id="cart-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>My Cart</h1>
            <p style={{ color: 'var(--gray-400)', marginTop: 4, fontSize: 'var(--text-sm)' }}>
                {cart.itemCount} item{cart.itemCount !== 1 ? 's' : ''} in your cart
            </p>

            <div className="cart-page__layout">
                {/* Cart Items */}
                <div>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <CartItemSkeleton key={i} />)
                    ) : (
                        <AnimatePresence>
                            {cart.items.map((item) => (
                                <motion.div
                                    className="cart-item"
                                    key={item.id}
                                    id={`cart-item-${item.id}`}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                >
                                    <img src={item.productImage || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200'} alt={item.productName} className="cart-item__image" />
                                    <div className="cart-item__info">
                                        <h3 className="cart-item__name">{item.productName}</h3>
                                        <p className="cart-item__unit">{item.productUnit}</p>
                                        <div className="cart-item__bottom">
                                            <div className="qty-control">
                                                <button className="qty-control__btn" onClick={() => handleQty(item.id, item.quantity - 1)}>
                                                    {item.quantity === 1 ? <FiTrash2 size={13} /> : <FiMinus size={14} />}
                                                </button>
                                                <AnimatePresence mode="wait">
                                                    <motion.span className="qty-control__value" key={item.quantity} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }} transition={{ duration: 0.12 }}>
                                                        {item.quantity}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <button className="qty-control__btn" onClick={() => handleQty(item.id, item.quantity + 1)}>
                                                    <FiPlus size={14} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className="cart-item__price">${item.totalPrice?.toFixed(2)}</span>
                                                <button className="cart-item__remove" onClick={() => handleRemove(item.id)}><FiTrash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* AI Tip */}
                    {!loading && cart.items.length > 0 && (
                        <motion.div className="ai-tip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <div className="ai-tip__header">
                                <RiLeafLine color="var(--primary)" size={16} />
                                <span className="ai-tip__label">AI Eco Tip</span>
                            </div>
                            <p className="ai-tip__text">
                                Switch to Oat Milk to save 40% water and reduce CO₂ by 2.3kg/L. Your cart's footprint is 15% below average! 🌍
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Summary */}
                <motion.div className="cart-summary" id="cart-summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="cart-summary__title">Order Summary</h3>
                    <div className="cart-summary__row">
                        <span>Subtotal ({cart.itemCount} items)</span>
                        <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>${parseFloat(cart.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="cart-summary__row">
                        <span>Delivery</span>
                        <span style={{ color: deliveryFee === 0 ? 'var(--primary)' : 'var(--gray-800)', fontWeight: 600 }}>
                            {deliveryFee === 0 ? 'FREE' : `$${deliveryFee}`}
                        </span>
                    </div>
                    {deliveryFee > 0 && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, margin: '0 0 8px' }}>
                            Add ${(25 - parseFloat(cart.totalAmount)).toFixed(2)} more for free delivery!
                        </p>
                    )}
                    <div className="cart-summary__row cart-summary__row--total">
                        <span>Total</span>
                        <span>${total}</span>
                    </div>

                    <div className="cart-summary__eco">
                        <RiLeafLine size={15} />
                        <span>Carbon: ~12kg CO₂e (15% below avg)</span>
                    </div>

                    <Link to="/checkout" className="btn btn--primary btn--lg btn--full" style={{ marginTop: 'var(--space-5)' }} id="checkout-btn">
                        Proceed to Checkout <FiArrowRight />
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}
