import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, searchProducts, getCategories } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export default function ProductListPage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy]         = useState('name');
  const [direction, setDirection]   = useState('asc');
  const [selectedCat, setSelectedCat] = useState(null);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [searchParams] = useSearchParams();
  const { addItem }    = useCart();
  const { isAuthenticated } = useAuth();
  const query      = searchParams.get('q');
  const catParam   = searchParams.get('category');

  /* init category from URL param */
  useEffect(() => {
    if (catParam) setSelectedCat(Number(catParam));
    else setSelectedCat(null);
  }, [catParam]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const catRes = await getCategories();
      setCategories(catRes.data || []);
      let res;
      if (query) {
        res = await searchProducts(query, page, 16);
      } else {
        res = await getProducts(page, 16, sortBy, direction);
      }
      const pageData = res.data;
      let content = pageData?.content ?? [];
      /* client-side filter by category / organic when not query mode */
      if (!query && selectedCat) content = content.filter(p => p.categoryId === selectedCat);
      if (organicOnly) content = content.filter(p => p.isOrganic);
      setProducts(content);
      setTotalPages(pageData?.totalPages ?? 0);
      setTotalElements(pageData?.totalElements ?? 0);
    } catch (err) {
      console.error('Products load error:', err);
      toast.error(err.userMessage || 'Could not load products — is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [page, query, sortBy, direction, selectedCat, organicOnly]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (productId) => {
    if (!isAuthenticated) { toast.error('Please sign in first'); return; }
    try {
      await addItem(productId, 1);
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add'); }
  };

  const clearFilters = () => {
    setSortBy('name'); setDirection('asc');
    setSelectedCat(null); setOrganicOnly(false); setPage(0);
  };

  const activeFilters = (selectedCat ? 1 : 0) + (organicOnly ? 1 : 0) + (sortBy !== 'name' || direction !== 'asc' ? 1 : 0);

  return (
    <motion.div
      className="products-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Page Header ── */}
      <div className="products-page__header">
        <div className="products-page__header-inner">
          <div>
            <h1 className="products-page__title">
              {query ? `Results for "${query}"` : 'All Products'}
            </h1>
            <p className="products-page__subtitle">
              {loading ? 'Loading…' : `${totalElements || products.length} products found`}
              {!query && ' · Sustainably sourced'}
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            className="btn btn--outline btn--sm products-page__filter-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            id="toggle-filters-btn"
          >
            <FiFilter size={14} />
            Filters {activeFilters > 0 && <span className="filter-badge">{activeFilters}</span>}
          </button>
        </div>
      </div>

      <div className="products-page__body">
        {/* ── Sidebar ── */}
        <AnimatePresence>
          {(sidebarOpen) && (
            <motion.aside
              className="products-sidebar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="products-sidebar__card">
                <div className="products-sidebar__head">
                  <h3><FiFilter size={13} /> Filters</h3>
                  {activeFilters > 0 && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                      <FiX size={12} /> Clear {activeFilters}
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="sidebar-section">
                  <h4 className="sidebar-section__label">Sort By</h4>
                  <select
                    className="form-input form-input--sm"
                    value={`${sortBy}:${direction}`}
                    onChange={(e) => {
                      const [s, d] = e.target.value.split(':');
                      setSortBy(s); setDirection(d); setPage(0);
                    }}
                    id="sort-select"
                  >
                    <option value="name:asc">Name A → Z</option>
                    <option value="name:desc">Name Z → A</option>
                    <option value="price:asc">Price: Low → High</option>
                    <option value="price:desc">Price: High → Low</option>
                    <option value="sustainabilityScore:desc">Eco Score</option>
                  </select>
                </div>

                {/* Categories */}
                <div className="sidebar-section">
                  <h4 className="sidebar-section__label">Category</h4>
                  <button
                    className={`sidebar-cat-btn ${!selectedCat ? 'sidebar-cat-btn--active' : ''}`}
                    onClick={() => { setSelectedCat(null); setPage(0); }}
                    id="cat-all"
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`sidebar-cat-btn ${selectedCat === cat.id ? 'sidebar-cat-btn--active' : ''}`}
                      onClick={() => { setSelectedCat(cat.id); setPage(0); }}
                      id={`cat-filter-${cat.id}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Preferences */}
                <div className="sidebar-section">
                  <h4 className="sidebar-section__label">Preferences</h4>
                  <label className="sidebar-checkbox">
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => { setOrganicOnly(e.target.checked); setPage(0); }}
                      id="filter-organic"
                    />
                    <RiLeafLine size={13} /> Organic Only
                  </label>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Product Grid ── */}
        <main className="products-main">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="empty-state__icon">🔍</div>
              <h3 className="empty-state__title">No products found</h3>
              <p className="empty-state__text">Try adjusting your search or filters</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="btn btn--secondary" onClick={clearFilters}>Clear Filters</button>
                <Link to="/products" className="btn btn--primary">Browse All</Link>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                className="product-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAdd} index={i} />
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn--sm btn--secondary"
                    disabled={page === 0}
                    onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    id="prev-page-btn"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className={`btn btn--sm ${i === page ? 'btn--primary' : 'btn--secondary'}`}
                      id={`page-btn-${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn--sm btn--secondary"
                    disabled={page === totalPages - 1}
                    onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    id="next-page-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </motion.div>
  );
}
