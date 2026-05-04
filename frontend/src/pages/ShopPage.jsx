import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import HeroBanner from '../components/shop/HeroBanner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../api/productApi';
import toast from 'react-hot-toast';

const PAGE_SIZE = 12;

export default function ShopPage() {
  const [allProducts, setAllProducts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(0);
  const [hasMore, setHasMore]           = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy]             = useState('name');
  const [categories, setCategories]     = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ── Fetch products from backend ──────────────────────────────
  const fetchProducts = useCallback(async (pageNum = 0, replace = true) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        size: PAGE_SIZE,
        sortBy,
        direction: 'asc'
      };
      
      if (activeCategory && activeCategory !== 'all') {
        params.category = activeCategory;
      }
      
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await getProducts(params);
      const pageData = res.data;
      const content  = pageData?.content ?? (Array.isArray(pageData) ? pageData : []);
      const totalPages = pageData?.totalPages ?? 1;

      setAllProducts(prev => replace ? content : [...prev, ...content]);
      setHasMore(pageNum + 1 < totalPages);
      setPage(pageNum);
    } catch (err) {
      console.error('ShopPage load error:', err);
      toast.error('Could not load products');
    } finally {
      setLoading(false);
    }
  }, [sortBy, activeCategory, debouncedSearch]);

  useEffect(() => {
    fetchProducts(0, true);
  }, [fetchProducts]);

  // Fetch categories
  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCats();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Category filter from URL ─────────────────────────────────
  const handleCategoryChange = (catId) => {
    if (catId === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  // ── Client-side filtering (removed, now server-side) ─────────
  const visibleProducts = allProducts;

  // ── Add to cart ──────────────────────────────────────────────
  const handleAdd = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }
    try {
      await addItem(productId, 1);
      toast.success('Added to cart! 🛒');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  // ── Load more ────────────────────────────────────────────────
  const handleLoadMore = () => {
    fetchProducts(page + 1, false);
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] font-sans flex flex-col">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-8 flex flex-col flex-grow pb-20">

        {/* Hero Banner */}
        <div className="mt-4 mb-14">
          <HeroBanner />
        </div>

        {/* Main Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-16">

          {/* Sidebar */}
          <div className="hidden md:block">
            <FilterSidebar
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categories={categories}
            />
          </div>

          {/* Right content */}
          <div className="flex-1 flex flex-col">

            {/* Mobile search bar */}
            <div className="flex md:hidden mb-6">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-[14px] text-[#422701] placeholder-[#C6C0B9] border border-[#C6C0B9]/40 focus:outline-none focus:border-[#D6B588] transition-colors"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#705E46]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>

            {/* Sort & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <span className="text-[15px] text-[#705E46]">
                {loading && allProducts.length === 0
                  ? 'Loading...'
                  : `Showing ${visibleProducts.length} curated items`}
              </span>
              <div className="flex items-center gap-2">
                <label className="text-[14px] text-[#422701] font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-[14px] text-[#422701] font-medium bg-transparent border border-[#C6C0B9]/50 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D6B588] cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading && allProducts.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden">
                    <div className="h-60 bg-gray-200 w-full"></div>
                    <div className="p-6 flex flex-col gap-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-7 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleProducts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-[#705E46] text-lg mb-2">No products found</p>
                <p className="text-[#C6C0B9] text-sm mb-6">Try a different category or search term</p>
                <button
                  onClick={() => { handleCategoryChange('all'); setSearchQuery(''); }}
                  className="inline-block bg-[#D6B588] text-[#422701] px-6 py-3 rounded-xl font-bold hover:bg-[#c9a777] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
                  {visibleProducts.map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onAdd={() => handleAdd(prod.id)}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="w-full flex justify-center mb-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-10 py-3.5 rounded-lg border border-[#705E46] text-[#422701] text-[15px] font-semibold hover:bg-[#705E46] hover:text-white transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
