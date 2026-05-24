import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, searchProducts, getCategories } from '../api/productApi';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import { FiFilter, FiX } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import { ProductSkeleton } from '../components/common/Skeleton';
import { staggerContainer, fadeInScale } from '../utils/animations';

export default function ProductListPage() {
  const [page, setPage]             = useState(0);
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

  // Fetch categories query
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 60000,
  });
  const categories = categoriesData ?? [];

  // Fetch products query
  const { data: pageData, isFetching: productsFetching, isLoading: productsLoading, error } = useQuery({
    queryKey: ['products', { page, query, selectedCat, sortBy, direction, organicOnly }],
    queryFn: async () => {
      let res;
      if (query) {
        res = await searchProducts(query, page, 16);
      } else if (selectedCat) {
        res = await API.get(`/products/category/${selectedCat}?page=${page}&size=16`);
      } else {
        res = await getProducts(page, 16, sortBy, direction);
      }
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30000,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.userMessage || 'Could not load products — is the backend running?');
    }
  }, [error]);

  const products = pageData?.content 
    ? (organicOnly ? pageData.content.filter(p => p.isOrganic) : pageData.content)
    : [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? products.length;
  const loading = productsLoading || productsFetching;

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
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="products-page__title">
              {query ? `Results for "${query}"` : 'All Products'}
            </h1>
            <p className="products-page__subtitle">
              {loading ? 'Searching fresh pantry…' : `${totalElements || products.length} products found`}
              {!query && ' · Sustainably sourced'}
            </p>
          </motion.div>
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
            <div className="product-grid">
              {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
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
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="product-grid"
              >
                {products.map((product, i) => (
                  <motion.div key={product.id} variants={fadeInScale}>
                    <ProductCard product={product} onAdd={() => handleAdd(product.id)} />
                  </motion.div>
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
