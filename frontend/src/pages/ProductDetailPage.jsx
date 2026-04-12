import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, getSimilarProducts } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import { DetailSkeleton } from '../components/ui/Skeletons';
import { FiMinus, FiPlus, FiShoppingCart, FiHeart, FiCheck, FiTruck, FiShield } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [imgError, setImgError] = useState(false);
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [prodRes, simRes] = await Promise.all([getProduct(id), getSimilarProducts(id)]);
                setProduct(prodRes.data);
                setSimilar(simRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
        window.scrollTo({ top: 0 });
    }, [id]);

    const handleAdd = async (pid) => {
        const targetId = pid || product.id;
        if (!isAuthenticated) { toast.error('Please sign in first'); return; }
        setAdding(true);
        try {
            await addItem(targetId, pid ? 1 : quantity);
            toast.success('Added to cart!', { icon: '🛒' });
        } catch { toast.error('Failed to add'); }
        finally { setTimeout(() => setAdding(false), 500); }
    };

    if (loading) return <div className="product-detail"><DetailSkeleton /></div>;
    if (!product) return <div className="product-detail"><div className="empty-state"><div className="empty-state__icon">😕</div><h3 className="empty-state__title">Product not found</h3></div></div>;

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const price = hasDiscount ? product.discountPrice : product.price;
    const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    return (
        <motion.div className="product-detail" id="product-detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <Link to="/">Home</Link><span>/</span>
                <Link to="/products">Products</Link><span>/</span>
                <span style={{ color: 'var(--gray-600)' }}>{product.name}</span>
            </div>

            <div className="product-detail__layout">
                {/* Image */}
                <motion.div className="product-detail__image-wrap" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
                    {imgError || !product.imageUrl ? (
                        <RiLeafLine size={80} style={{ color: '#9ca3af', opacity: 0.3 }} />
                    ) : (
                        <img src={product.imageUrl} alt={product.name} className="product-detail__image" style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} onError={() => setImgError(true)} />
                    )}
                </motion.div>

                {/* Info */}
                <motion.div className="product-detail__info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                    <div className="product-detail__badges">
                        {product.isOrganic && <span className="tag tag--green">🌱 Organic</span>}
                        {product.isFeatured && <span className="tag tag--orange">⭐ Featured</span>}
                        {hasDiscount && <span className="tag tag--red">{discountPct}% OFF</span>}
                    </div>

                    <h1>{product.name}</h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                        {product.unit} · {product.origin}
                    </p>

                    <div className="product-detail__price-section">
                        <span className="product-detail__current-price">${price}</span>
                        {hasDiscount && <span className="product-detail__original-price">${product.price}</span>}
                    </div>

                    <p style={{ color: 'var(--gray-500)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>
                        {product.description}
                    </p>

                    {/* Sustainability */}
                    {product.sustainabilityScore && (
                        <div className="product-detail__sustainability">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <RiLeafLine color="var(--primary)" size={18} />
                                <strong style={{ color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>Eco Score: {product.sustainabilityScore}/10</strong>
                            </div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: 0 }}>
                                Carbon: {product.carbonFootprint} kg CO₂e · Fresh for {product.freshnessDays} days
                            </p>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="product-detail__qty-selector">
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>Qty:</span>
                        <div className="qty-control">
                            <button className="qty-control__btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}><FiMinus size={15} /></button>
                            <AnimatePresence mode="wait">
                                <motion.span className="qty-control__value" key={quantity} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    {quantity}
                                </motion.span>
                            </AnimatePresence>
                            <button className="qty-control__btn" onClick={() => setQuantity(q => q + 1)}><FiPlus size={15} /></button>
                        </div>
                    </div>

                    {/* CTA */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <motion.button
                            className="btn btn--primary btn--lg"
                            onClick={() => handleAdd()}
                            id="add-to-cart-main"
                            style={{ flex: 1, fontSize: 'var(--text-md)' }}
                            whileTap={{ scale: 0.97 }}
                            disabled={adding}
                        >
                            {adding ? <><FiCheck /> Added!</> : <><FiShoppingCart /> Add to Cart — ${(price * quantity).toFixed(2)}</>}
                        </motion.button>
                        <motion.button className="btn btn--secondary btn--lg" whileTap={{ scale: 0.95 }}>
                            <FiHeart size={18} />
                        </motion.button>
                    </div>

                    {/* Trust signals */}
                    <div style={{ marginTop: 'var(--space-5)', display: 'flex', gap: 'var(--space-5)', fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCheck color="var(--success)" size={13} /> {product.stockQuantity > 10 ? 'In Stock' : `Only ${product.stockQuantity} left`}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiTruck size={13} /> Free delivery $25+</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiShield size={13} /> Quality guaranteed</span>
                    </div>
                </motion.div>
            </div>

            {/* Similar */}
            {similar.length > 0 && (
                <section style={{ marginTop: 'var(--space-12)' }}>
                    <h2 className="section__title" style={{ marginBottom: 'var(--space-5)' }}>Customers Also Bought</h2>
                    <div className="product-grid">
                        {similar.map((p, i) => <ProductCard key={p.id} product={p} onAddToCart={handleAdd} index={i} />)}
                    </div>
                </section>
            )}
        </motion.div>
    );
}
