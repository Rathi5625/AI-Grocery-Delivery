import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/shop/FilterSidebar';
import ProductCard from '../components/shop/ProductCard';
import HeroBanner from '../components/shop/HeroBanner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories } from '../api/productApi';
import toast from 'react-hot-toast';

const PAGE_SIZE = 12;

// ── Pagination bar component ──────────────────────────────────────────────────
function PaginationBar({ currentPage, totalPages, onPageChange, loading }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // pages shown around current
    const left  = Math.max(0, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    if (left > 0) {
      pages.push(0);
      if (left > 1) pages.push('...');
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) {
      if (right < totalPages - 2) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-10 mb-4 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#C6C0B9]/60 text-[#422701] text-[13px] font-semibold
                   hover:bg-[#705E46] hover:text-white hover:border-[#705E46] transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#422701] disabled:hover:border-[#C6C0B9]/60"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Prev
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 py-2 text-[#705E46] text-[13px] select-none">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={`min-w-[36px] h-[36px] rounded-lg text-[13px] font-semibold transition-all duration-200 border
              ${page === currentPage
                ? 'bg-[#422701] text-white border-[#422701] shadow-md scale-105'
                : 'border-[#C6C0B9]/60 text-[#422701] hover:bg-[#D6B588]/30 hover:border-[#D6B588]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {page + 1}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 || loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#C6C0B9]/60 text-[#422701] text-[13px] font-semibold
                   hover:bg-[#705E46] hover:text-white hover:border-[#705E46] transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#422701] disabled:hover:border-[#C6C0B9]/60"
      >
        Next
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// ── Main ShopPage ─────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [page, setPage]                 = useState(0);
  const [searchQuery, setSearchQuery]   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy]             = useState('name');

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const { addItem }        = useCart();
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [sortBy, activeCategory, debouncedSearch]);

  // Fetch products query
  const { data: pageData, isFetching: productsFetching, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { page, sortBy, activeCategory, debouncedSearch }],
    queryFn: async () => {
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy,
        direction: 'asc',
      };
      if (activeCategory && activeCategory !== 'all') params.category = activeCategory;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await getProducts(params);
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 30000,
  });

  const products = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const loading = productsLoading || productsFetching;

  // Fetch categories query
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories();
      return res.data ?? [];
    },
    staleTime: 60000,
  });
  const categories = categoriesData ?? [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCategoryChange = (catId) => {
    if (catId === 'all') setSearchParams({});
    else setSearchParams({ category: catId });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  // ── Pagination info text ──────────────────────────────────────────────────
  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="min-h-screen bg-[#F5F1EB] font-sans flex flex-col">

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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* Sort & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] text-[#705E46]">
                  {loading && products.length === 0
                    ? 'Loading...'
                    : totalElements > 0
                      ? `Showing ${startItem}–${endItem} of ${totalElements} products`
                      : 'No products found'}
                </span>
                {totalPages > 1 && !loading && (
                  <span className="text-[12px] text-[#C6C0B9]">
                    Page {page + 1} of {totalPages}
                  </span>
                )}
              </div>

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
            {loading && products.length === 0 ? (
              /* Skeleton */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden">
                    <div className="h-60 bg-gray-200 w-full" />
                    <div className="p-6 flex flex-col gap-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-6 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="flex justify-between items-center pt-2">
                        <div className="h-7 bg-gray-200 rounded w-1/4" />
                        <div className="h-9 w-9 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty state */
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
                {/* Grid — subtle fade when changing page */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-4 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                >
                  {products.map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onAdd={() => handleAdd(prod.id)}
                    />
                  ))}
                </div>

                {/* Pagination controls */}
                <PaginationBar
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />

                {/* Loading overlay text */}
                {loading && (
                  <p className="text-center text-[13px] text-[#705E46] mt-2 animate-pulse">
                    Loading page {page + 1}…
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
