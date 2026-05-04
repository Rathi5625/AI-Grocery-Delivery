import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { getSimilarProducts, getProducts } from '../../api/productApi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const RelatedProducts = ({ productId }) => {
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        // Try the similar endpoint first, fall back to regular product list
        let products = [];
        if (productId) {
          try {
            const res = await getSimilarProducts(productId);
            const data = res.data;
            products = data?.content ?? (Array.isArray(data) ? data : []);
          } catch {
            // similar endpoint not available, fallback
          }
        }
        if (products.length === 0) {
          const res = await getProducts(0, 4, 'name', 'asc');
          const data = res.data;
          products = (data?.content ?? (Array.isArray(data) ? data : [])).slice(0, 4);
          // Exclude current product
          if (productId) products = products.filter(p => String(p.id) !== String(productId)).slice(0, 4);
        }
        setRelated(products.slice(0, 4));
      } catch (err) {
        console.error('Failed to load related products:', err);
      }
    };
    load();
  }, [productId]);

  const handleAdd = async (id) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }
    try {
      await addItem(id, 1);
      toast.success('Added to cart! 🛒');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  if (related.length === 0) return null;

  return (
    <div className="w-full mt-16 pt-12 border-t border-[#C6C0B9]/40">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[22px] font-bold text-[#422701] tracking-tight">You May Also Like</h2>
        <Link to="/shop" className="text-sm text-[#705E46] hover:text-[#422701] font-medium transition-colors border-b border-transparent hover:border-[#422701] pb-0.5">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {related.map(prod => (
          <ProductCard key={prod.id} product={prod} onAdd={() => handleAdd(prod.id)} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
