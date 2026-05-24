import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { getOrder } from '../api/orderApi';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading: loading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await getOrder(id);
      return res.data;
    },
    enabled: !!id,
    staleTime: 30000,
  });

  useEffect(() => {
    if (isError) {
      toast.error('Failed to load order details.');
      navigate('/orders');
    }
  }, [isError, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-[#422701]">
        Loading order details...
      </div>
    );
  }

  if (!order) return null;

  const statusLower = (order.status || 'pending').toLowerCase();
  let badgeColor = 'bg-[#E5DAC6] text-[#705E46]';
  if (statusLower === 'delivered') {
    badgeColor = 'bg-green-100 text-green-700 border border-green-200';
  } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
    badgeColor = 'bg-red-100 text-red-700 border border-red-200';
  }

  const dateStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
    : 'N/A';

  const items = order.items || [];
  const subtotal = Number(order.totalAmount || 0); // Need proper subtotal ideally from backend, assume totalAmount here includes fees for now, or just show totalAmount.

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-24">
      {/* Header */}
      <nav className="flex items-center px-6 md:px-8 py-5 bg-[#FAF7F2] sticky top-0 z-40 border-b border-[#C6C0B9]/20">
        <button 
          onClick={() => navigate('/orders')}
          className="p-2 -ml-2 text-[#422701] hover:bg-[#C6C0B9]/20 rounded-full transition-colors mr-3"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-[1.1rem] font-medium text-[#422701]">Order Details</h1>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        
        {/* Order Header Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#C6C0B9]/20 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[1.5rem] font-medium text-[#422701] mb-1">
                Order {order.orderNumber || `#AG-${order.id}`}
              </h2>
              <p className="text-[#705E46] text-[0.95rem]">{dateStr}</p>
            </div>
            <span className={`inline-flex px-4 py-1.5 rounded-full font-medium tracking-wider text-[0.85rem] self-start md:self-auto ${badgeColor}`}>
              {order.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#C6C0B9]/20 mb-6">
          <h3 className="text-[1.1rem] font-medium text-[#422701] mb-6 flex items-center gap-2">
            <FiPackage className="text-[#D6B588]" /> Items Ordered
          </h3>
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl bg-[#E8E1D7] overflow-hidden shrink-0">
                  <img 
                    src={item.productImage || item.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'} 
                    alt={item.productName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-[0.95rem] font-medium text-[#422701] leading-tight">
                    {item.productName}
                  </h4>
                  <p className="text-[#705E46] text-[0.85rem] mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-[#422701]">₹{Number(item.totalPrice || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#C6C0B9]/20">
            <h3 className="text-[1.1rem] font-medium text-[#422701] mb-5">Payment Summary</h3>
            <div className="space-y-3 mb-5 border-b border-[#C6C0B9]/20 pb-5">
              <div className="flex justify-between text-[#705E46] text-[0.95rem]">
                <span>Total Amount</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[#422701] font-bold text-[1.2rem]">
              <span>Total Paid</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 flex items-start gap-3 text-[#705E46] text-[0.9rem] bg-[#FDFBF7] p-4 rounded-xl border border-[#C6C0B9]/20">
              <FiCreditCard className="mt-0.5 text-[#D6B588]" />
              <div>
                <span className="block font-medium text-[#422701] mb-0.5">Payment Method</span>
                {order.paymentMethod || 'Online'}
              </div>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#C6C0B9]/20">
            <h3 className="text-[1.1rem] font-medium text-[#422701] mb-5 flex items-center gap-2">
              <FiMapPin className="text-[#D6B588]" /> Delivery Details
            </h3>
            <div className="text-[#705E46] text-[0.95rem] leading-relaxed">
              {order.deliveryAddress || 'No address provided.'}
            </div>
            
            {order.notes && (
              <div className="mt-5 pt-5 border-t border-[#C6C0B9]/20">
                <span className="block font-medium text-[#422701] mb-1">Order Notes</span>
                <p className="text-[#705E46] text-[0.9rem] italic">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
