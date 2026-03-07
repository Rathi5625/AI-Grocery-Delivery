import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProducts, searchProducts, getCategories } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';
import { FiFilter, FiX } from 'react-icons/fi';

export default function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortBy, setSortBy] = useState('name');
    const [direction, setDirection] = useState('asc');
    const [searchParams] = useSearchParams();
    const { addItem } = useCart();
    const { isAuthenticated } = useAuth();
    const query = searchParams.get('q');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const catRes = await getCategories();
                setCategories(catRes.data);
                let res;
                if (query) {
                    res = await searchProducts(query, page, 12);
                } else {
                    res = await getProducts(page, 12, sortBy, direction);
                }
                setProducts(res.data.content);
                setTotalPages(res.data.totalPages);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [page, query, sortBy, direction]);

    const handleAdd = async (productId) => {
        if (!isAuthenticated) { toast.error('Please sign in first'); return; }
        try {
            await addItem(productId, 1);
            toast.success('Added to cart!', { icon: '🛒' });
        } catch { toast.error('Failed to add'); }
    };

    return (
        <motion.div
            style={{ marginTop: 'var(--nav-h)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Page Header */}
            <div style={{ background: 'white', borderBottom: '1px solid var(--gray-100)', padding: 'var(--space-6)' }}>
                <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gray-900)' }}>
                        {query ? `Results for "${query}"` : 'All Products'}
                    </h1>
                    <p style={{ color: 'var(--gray-400)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
                        {products.length} products found{!query && ' · Sustainably sourced'}
                    </p>
                </div>
            </div>

            <div className="section" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
                {/* ── SIDEBAR FILTERS ── */}
                <aside style={{ width: 220, flexShrink: 0, position: 'sticky', top: 'calc(var(--nav-h) + var(--space-6))' }}>
                    <div style={{ background: 'white', borderRadius: 'var(--r-xl)', padding: 'var(--space-5)', border: '1px solid var(--gray-100)' }}>
                        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <FiFilter size={14} /> Filters
                        </h3>

                        {/* Sort */}
                        <div style={{ marginBottom: 'var(--space-5)' }}>
                            <h4 style={{ fontSize: 11, fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sort By</h4>
                            <select
                                value={`${sortBy}:${direction}`}
                                onChange={(e) => { const [s, d] = e.target.value.split(':'); setSortBy(s); setDirection(d); setPage(0); }}
                                className="form-input"
                                style={{ padding: '8px 12px', fontSize: 'var(--text-xs)' }}
                            >
                                <option value="name:asc">Name A-Z</option>
                                <option value="name:desc">Name Z-A</option>
                                <option value="price:asc">Price: Low to High</option>
                                <option value="price:desc">Price: High to Low</option>
                            </select>
                        </div>

                        {/* Categories */}
                        <div style={{ marginBottom: 'var(--space-5)' }}>
                            <h4 style={{ fontSize: 11, fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</h4>
                            {categories.map(cat => (
                                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', fontSize: 'var(--text-xs)', cursor: 'pointer', color: 'var(--gray-700)' }}>
                                    <input type="checkbox" readOnly style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
                                    {cat.name}
                                </label>
                            ))}
                        </div>

                        {/* Dietary */}
                        <div>
                            <h4 style={{ fontSize: 11, fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferences</h4>
                            {['Organic', 'Vegan', 'Gluten-Free', 'Keto'].map(d => (
                                <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', fontSize: 'var(--text-xs)', cursor: 'pointer', color: 'var(--gray-700)' }}>
                                    <input type="checkbox" style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} /> {d}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ── PRODUCT GRID ── */}
                <main style={{ flex: 1 }}>
                    {loading ? (
                        <ProductGridSkeleton count={8} />
                    ) : products.length === 0 ? (
                        <motion.div className="empty-state" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="empty-state__icon">🔍</div>
                            <h3 className="empty-state__title">No products found</h3>
                            <p className="empty-state__text">Try adjusting your search or filters</p>
                            <Link to="/products" className="btn btn--primary">Clear Filters</Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="product-grid">
                                {products.map((product, i) => (
                                    <ProductCard key={product.id} product={product} onAddToCart={handleAdd} index={i} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 'var(--space-8)' }}>
                                    {Array.from({ length: Math.min(totalPages, 8) }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`btn btn--sm ${i === page ? 'btn--primary' : 'btn--secondary'}`}
                                            style={{ minWidth: 36, padding: '6px 12px' }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </motion.div>
    );
}
