import React from 'react';
import { Link } from 'react-router-dom';

export default function OrderCard({ order }) {
  const statusLower = (order.status || 'pending').toLowerCase();
  
  // Status Badge Colors
  let badgeColor = 'bg-[#E5DAC6] text-[#705E46]'; // default / pending (yellowish)
  if (statusLower === 'delivered') {
    badgeColor = 'bg-green-100 text-green-700 border border-green-200';
  } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
    badgeColor = 'bg-red-100 text-red-700 border border-red-200';
  }

  // Format Date
  const dateStr = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    : 'N/A';

  // Extract Preview Data
  const items = order.items || [];
  const previewImage = items[0]?.productImage || items[0]?.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200';
  
  // Create preview text "Item 1, Item 2 + 2 more"
  let previewText = 'Order items';
  if (items.length > 0) {
    const firstTwo = items.slice(0, 2).map(i => i.productName).join(', ');
    const remaining = items.length > 2 ? ` + ${items.length - 2} more` : '';
    previewText = firstTwo + remaining;
  }

  const total = Number(order.totalAmount || 0);

  return (
    <Link to={`/orders/${order.id}`} className="block h-full group">
      <div className="bg-[#F2ECE4] rounded-2xl p-7 shadow-sm border border-[#C6C0B9]/20 transition-all hover:shadow-md hover:scale-[1.01] flex flex-col h-full cursor-pointer">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-1.5">
          <span className="text-[#705E46] text-[0.8rem] tracking-wide">Order {order.orderNumber || `#AG-${order.id}`}</span>
          <span className={`text-[0.7rem] px-3 py-1 rounded-full font-medium tracking-wider ${badgeColor}`}>
            {order.status || 'Pending'}
          </span>
        </div>
        
        {/* Date */}
        <h3 className="text-[1.6rem] font-medium text-[#422701] mb-6">{dateStr}</h3>
        
        <div className="border-t border-[#C6C0B9]/30 w-full mb-6"></div>
        
        {/* Product Preview */}
        <div className="flex items-center gap-4 mb-6 flex-1">
          <div className="w-[56px] h-[56px] rounded-xl bg-[#E8E1D7] shrink-0 flex items-center justify-center overflow-hidden">
            <img src={previewImage} alt="Products" className="w-full h-full object-cover" />
          </div>
          <p className="text-[#705E46] text-[0.95rem] leading-relaxed line-clamp-2">
            {previewText}
          </p>
        </div>
        
        <div className="border-t border-[#C6C0B9]/30 w-full mb-6"></div>
        
        {/* Price & Action */}
        <div className="flex justify-between items-center mt-auto">
          <span className="text-[1.3rem] font-bold text-[#422701]">${total.toFixed(2)}</span>
          <button className="bg-[#D6B588] text-[#422701] px-5 py-2.5 rounded-lg text-sm font-medium transition-colors group-hover:bg-[#cba878]">
            View Details
          </button>
        </div>
        
      </div>
    </Link>
  );
}
