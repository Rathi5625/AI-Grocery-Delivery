import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFeaturedProducts, getCategories } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import { staggerContainer, slideUp } from '../animations/variants';
import { FiArrowRight, FiZap, FiTruck, FiShield, FiClock } from 'react-icons/fi';
import { RiLeafLine, RiSparklingLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = ['🥬', '🥛', '🍞', '☕', '🫙', '🧊', '🌱', '🍿'];

export default function HomePage() {
    const [featured, setFeatured] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const load = async () => {
            try {
                const [featRes, catRes] = await Promise.all([getFeaturedProducts(), getCategories()]);
                setFeatured(featRes.data);
                setCategories(catRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAdd = async (productId) => {
        if (!isAuthenticated) { toast.error('Please sign in to add items'); return; }
        try {
            await addItem(productId, 1);
            toast.success('Added to cart!', { icon: '🛒' });
        } catch { toast.error('Failed to add'); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            {/* ── HERO ── */}
            <section className="hero" id="hero">
                <div className="hero__decor">
                    <div className="hero__blob hero__blob--1" />
                    <div className="hero__blob hero__blob--2" />
                </div>
                <div className="hero__inner">
                    <motion.div {...slideUp}>
                        <span className="hero__eyebrow">
                            <FiZap size={13} /> AI-Powered Grocery Platform
                        </span>
                    </motion.div>
                    <motion.h1 className="hero__title" {...slideUp} transition={{ delay: 0.1, duration: 0.5 }}>
                        Groceries delivered<br />in 10 minutes
                    </motion.h1>
                    <motion.p className="hero__subtitle" {...slideUp} transition={{ delay: 0.2, duration: 0.5 }}>
                        Farm-fresh produce, AI-curated picks, and sustainable packaging —
                        all delivered to your doorstep by our eco-friendly fleet.
                    </motion.p>
                    <motion.div className="hero__actions" {...slideUp} transition={{ delay: 0.3, duration: 0.5 }}>
                        <Link to="/products" className="btn btn--lg" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
                            Order Now <FiArrowRight />
                        </Link>
                        <Link to="/products?featured=true" className="btn btn--lg btn--outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                            <FiZap /> Today's Deals
                        </Link>
                    </motion.div>

                    <motion.div className="hero__stats" {...slideUp} transition={{ delay: 0.4, duration: 0.5 }}>
                        {[
                            { icon: <FiClock />, value: '10 min', label: 'Avg. Delivery' },
                            { icon: <RiLeafLine />, value: '12K kg', label: 'CO₂ Saved' },
                            { icon: <FiShield />, value: '50K+', label: 'Happy Customers' },
                            { icon: <FiTruck />, value: '8,200', label: 'Eco Deliveries' },
                        ].map((s, i) => (
                            <div className="hero__stat" key={i}>
                                <div className="hero__stat-value">{s.value}</div>
                                <div className="hero__stat-label">{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ── DEALS BANNER ── */}
            <div className="section">
                <motion.div className="deal-banner" {...slideUp} transition={{ delay: 0.1 }}>
                    <div className="deal-banner__content">
                        <h3>⚡ Flash Sale — Up to 40% Off</h3>
                        <p>On organic fruits, fresh veggies & dairy essentials</p>
                    </div>
                    <div className="deal-banner__timer">
                        {[{ v: '06', l: 'HRS' }, { v: '23', l: 'MIN' }, { v: '41', l: 'SEC' }].map((t, i) => (
                            <div className="deal-banner__time-block" key={i}>
                                <strong>{t.v}</strong>
                                <span>{t.l}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── CATEGORIES ── */}
            <section className="section" id="categories-section" style={{ paddingTop: 0 }}>
                <div className="section__header">
                    <div>
                        <h2 className="section__title">Shop by Category</h2>
                        <p className="section__subtitle">Browse our fresh, sustainably sourced products</p>
                    </div>
                    <Link to="/products" className="section__see-all">See all <FiArrowRight size={14} /></Link>
                </div>
                <motion.div
                    className="category-strip"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}
                        >
                            <Link to={`/products?category=${cat.id}`} className="category-chip" id={`cat-${cat.slug}`}>
                                <span className="category-chip__icon">{CATEGORY_ICONS[i] || '🛒'}</span>
                                <span className="category-chip__name">{cat.name}</span>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ── FEATURED PRODUCTS ── */}
            <section className="section" id="featured-section" style={{ paddingTop: 0 }}>
                <div className="section__header">
                    <div>
                        <h2 className="section__title">Picked for You</h2>
                        <p className="section__subtitle">AI-curated based on seasonal availability</p>
                    </div>
                    <Link to="/products" className="section__see-all">View all <FiArrowRight size={14} /></Link>
                </div>
                {loading ? (
                    <ProductGridSkeleton count={8} />
                ) : (
                    <div className="product-grid--wide">
                        <div className="product-grid">
                            {featured.map((product, i) => (
                                <ProductCard key={product.id} product={product} onAddToCart={handleAdd} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* ── SUSTAINABILITY SECTION ── */}
            <motion.section
                style={{ padding: 'var(--space-12) var(--space-6)', background: 'var(--primary-lighter)' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--gray-900)' }}>
                        Every Order Makes a Difference 🌍
                    </h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-md)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
                        Our AI tracks carbon footprint per item, suggests eco-friendly swaps,
                        and reduces food waste by matching you with products at peak freshness.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-10)' }}>
                        {[
                            { value: '12,450 kg', label: 'CO₂ Saved', icon: '🌱' },
                            { value: '8,200+', label: 'Eco Deliveries', icon: '🚲' },
                            { value: '95%', label: 'Fresh Guarantee', icon: '✨' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--primary)' }}>{stat.value}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 4 }}>{stat.icon} {stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}
