import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProduct } from '../api/productApi';
import QuantitySelector from '../components/product/QuantitySelector';
import RelatedProducts from '../components/product/RelatedProducts';
import toast from 'react-hot-toast';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [qty, setQty]         = useState(1);
  const [adding, setAdding]   = useState(false);

  useEffect(() => {
    if (!id) { setError(true); setLoading(false); return; }
    const load = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await getProduct(id);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }
    if (!product) return;
    try {
      setAdding(true);
      await addItem(product.id, qty);
      toast.success(`Added ${product.name} to cart 🛒`);
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex items-center justify-center">
        <div className="animate-pulse flex flex-col md:flex-row gap-12 w-full max-w-[1200px] px-8">
          <div className="w-full md:w-1/2 aspect-square bg-[#EAE5DF] rounded-[24px]" />
          <div className="w-full md:w-1/2 flex flex-col gap-4 justify-center">
            <div className="h-4 bg-[#EAE5DF] rounded w-1/4" />
            <div className="h-10 bg-[#EAE5DF] rounded w-3/4" />
            <div className="h-4 bg-[#EAE5DF] rounded w-full" />
            <div className="h-4 bg-[#EAE5DF] rounded w-5/6" />
            <div className="h-8 bg-[#EAE5DF] rounded w-1/4 mt-4" />
            <div className="h-14 bg-[#EAE5DF] rounded w-full mt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not Found ────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="min-h-[70vh] bg-[#FAF8F5] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">🥬</div>
        <h2 className="text-2xl font-bold text-[#422701]">Product not found</h2>
        <p className="text-[#705E46] text-sm">This item may be out of stock or no longer available.</p>
        <Link to="/shop" className="mt-4 bg-[#D6B588] text-[#422701] px-8 py-3 rounded-xl font-semibold hover:bg-[#c5a374] transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const imageUrl = product.imageUrl || null;

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans flex flex-col text-[#422701]">

      {/* MAIN CONTENT */}
      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-8 pt-6 pb-24 flex-grow">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2.5 text-[13px] mb-10">
          <Link to="/shop" className="text-[#705E46] hover:text-[#422701] transition-colors">Shop</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          {product.categoryName && (
            <>
              <Link to={`/shop?category=${encodeURIComponent(product.categoryName)}`} className="text-[#705E46] hover:text-[#422701] transition-colors">
                {product.categoryName}
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </>
          )}
          <span className="font-semibold text-[#422701] truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* 2 COLUMN PRODUCT SECTION */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">

          {/* LEFT: IMAGE */}
          <div className="w-full md:w-1/2">
            <div className="relative w-full aspect-square bg-[#EAE5DF] rounded-[24px] overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.04)] flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl select-none">🥦</span>
              )}
              {/* Wishlist button */}
              <button className="absolute top-5 right-5 w-11 h-11 bg-[#F8F6F4] rounded-full flex items-center justify-center text-[#C6C0B9] hover:text-[#D6B588] hover:shadow-md transition-all shadow-sm focus:outline-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">

            {/* TAGS */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              {product.isOrganic && (
                <div className="bg-[#EAE5DF] px-3.5 py-1.5 rounded-full border border-[#C6C0B9]/30">
                  <span className="text-[12px] font-medium text-[#705E46]">🌿 Organic</span>
                </div>
              )}
              {product.categoryName && (
                <div className="bg-[#D6B588] px-3.5 py-1.5 rounded-full shadow-sm">
                  <span className="text-[12px] font-semibold text-[#422701]">{product.categoryName}</span>
                </div>
              )}
              {product.stockQuantity > 0 ? (
                <div className="bg-green-50 px-3.5 py-1.5 rounded-full border border-green-200">
                  <span className="text-[12px] font-medium text-green-700">In Stock ({product.stockQuantity})</span>
                </div>
              ) : (
                <div className="bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
                  <span className="text-[12px] font-medium text-red-600">Out of Stock</span>
                </div>
              )}
            </div>

            <h1 className="text-[38px] md:text-[44px] font-bold text-[#422701] mb-5 leading-[1.1] tracking-tight">
              {product.name}
            </h1>

            <p className="text-[16px] font-light leading-[1.8] mb-8 text-[#705E46]">
              {product.description || 'A premium quality product, carefully selected for you.'}
            </p>

            <div className="text-[34px] font-medium text-[#705E46] mb-2 tracking-tight">
              ₹{parseFloat(product.price || 0).toFixed(2)}
              {(product.weight || product.unit) && (
                <span className="text-[18px] font-normal text-[#C6C0B9] ml-2">/ {product.weight || product.unit}</span>
              )}
            </div>

            {product.discountPrice && product.discountPrice < product.price && (
              <div className="text-[14px] text-[#C6C0B9] line-through mb-6">
                ₹{parseFloat(product.discountPrice).toFixed(2)}
              </div>
            )}

            <div className="h-px w-full bg-[#C6C0B9]/30 my-8"></div>

            <div className="flex items-center justify-between mb-8 max-w-sm">
              <span className="text-[15px] font-medium text-[#422701]">Quantity</span>
              <QuantitySelector
                initial={qty}
                min={1}
                max={product.stockQuantity || 10}
                onChange={setQty}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stockQuantity === 0}
              className="w-full max-w-sm bg-[#D6B588] hover:bg-[#c5a374] text-[#422701] font-semibold py-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 mb-12 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                <span>Adding...</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>

            {/* FEATURE POINTS */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span className="text-[14px] text-[#705E46] font-light">Freshly sourced and delivered daily</span>
              </div>
              <div className="flex items-center gap-3.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
                <span className="text-[14px] text-[#705E46] font-light">100% Organic, sustainably sourced</span>
              </div>
              {product.origin && (
                <div className="flex items-center gap-3.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  <span className="text-[14px] text-[#705E46] font-light">Origin: {product.origin}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <RelatedProducts productId={id} />

      </div>
    </div>
  );
}
