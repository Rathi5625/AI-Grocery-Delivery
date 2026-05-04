import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiPackage } from 'react-icons/fi';
import { getOrders } from '../api/orderApi';
import OrderCard from '../components/order/OrderCard';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrders(0, 50); // Fetch up to 50 recent orders
        const data = res.data;
        const content = data?.content ?? (Array.isArray(data) ? data : []);
        setOrders(content);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to load your order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">
      {/* Header */}
      <nav className="flex justify-between items-center px-8 py-6 bg-[#C6C0B9]/30 border-b border-[#C6C0B9]/20 sticky top-0 z-50">
        <Link to="/" className="text-xl font-bold text-[#422701] tracking-tight">FreshAI</Link>
        
        <div className="hidden md:flex items-center gap-10 text-[#705E46] font-medium text-[0.95rem]">
          <Link to="/products" className="hover:text-[#422701] transition-colors">Shop</Link>
          <Link to="/shop" className="hover:text-[#422701] transition-colors">Curated</Link>
          <Link to="/orders" className="text-[#422701] font-bold">Orders</Link>
          <Link to="/profile" className="hover:text-[#422701] transition-colors">Profile</Link>
        </div>
        
        <div className="flex items-center gap-6 text-[#D6B588]">
          <Link to="/cart" className="hover:opacity-80 transition-opacity">
            <FiShoppingCart size={22} />
          </Link>
          <Link to="/profile" className="hover:opacity-80 transition-opacity">
            <FiUser size={22} />
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-14">
        <header className="mb-12">
          <h1 className="text-[2.2rem] font-medium text-[#422701] mb-3 tracking-tight">Order History</h1>
          <p className="text-[#705E46] text-[1.05rem]">
            Review your past organic selections and curated bundles.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse bg-[#EAE5DF] rounded-2xl h-80" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-[#F2ECE4] rounded-2xl border border-[#C6C0B9]/30">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-[#F2ECE4] rounded-2xl border border-[#C6C0B9]/30">
            <div className="w-16 h-16 bg-[#E8E1D7] rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage size={24} className="text-[#705E46]" />
            </div>
            <h2 className="text-[1.5rem] font-medium text-[#422701] mb-3 tracking-tight">No orders yet</h2>
            <p className="text-[#705E46] text-[1.05rem] mb-8">
              Start shopping to fill up your order history!
            </p>
            <Link 
              to="/shop" 
              className="inline-block px-8 py-3.5 bg-[#D6B588] hover:bg-[#cba878] text-[#422701] font-medium rounded-xl transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
