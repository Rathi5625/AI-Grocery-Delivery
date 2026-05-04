import React from 'react';
import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  DELIVERED:  { bg: '#E4F0E6', text: '#4A7851', border: '#A6C4A7' },
  COMPLETED:  { bg: '#E4F0E6', text: '#4A7851', border: '#A6C4A7' },
  PENDING:    { bg: '#F5EAD8', text: '#B08547', border: '#D6B588' },
  PROCESSING: { bg: '#E8EAF6', text: '#5C6BC0', border: '#9FA8DA' },
  SHIPPED:    { bg: '#E0F7FA', text: '#00838F', border: '#80DEEA' },
  CANCELLED:  { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
};

const OrdersCard = ({ hook }) => {
  const loading = hook?.loadingOrders || false;
  const apiOrders = hook?.profile?.recentOrders || [];

  const getStatusStyle = (status) => STATUS_STYLES[status?.toUpperCase()] || STATUS_STYLES.PENDING;

  const displayOrders = apiOrders.length > 0 ? apiOrders.slice(0, 2) : [];

  return (
    <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#C6C0B9]/20 w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="text-[22px] font-bold text-[#422701] tracking-tight mb-2">Recent Orders</h3>
          <p className="text-[14px] text-[#705E46] font-light">Your latest AI-curated deliveries.</p>
        </div>
        <Link to="/orders" className="flex items-center gap-1.5 text-[11px] font-bold text-[#705E46] tracking-[0.1em] uppercase hover:text-[#422701] transition-colors mt-1.5">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2].map(i => (
            <div key={i} className="animate-pulse bg-[#FAF8F5] rounded-2xl h-48 border border-[#EAE5DF]" />
          ))}
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DF] text-center">
          <span className="text-4xl mb-4">🛍️</span>
          <h4 className="text-[#422701] font-bold text-lg mb-2">No orders yet</h4>
          <p className="text-[#705E46] text-sm mb-6 max-w-sm">Looks like you haven't placed any orders yet. Discover our fresh, organic selections today!</p>
          <Link to="/shop" className="bg-[#D6B588] text-[#422701] font-bold px-6 py-2.5 rounded-xl hover:bg-[#c5a374] transition-colors shadow-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayOrders.map((order, idx) => {
            const style = getStatusStyle(order.status);
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
            return (
              <div key={idx} className="flex flex-col border border-[#EAE5DF] rounded-2xl p-6 hover:shadow-md transition-shadow bg-white"
                   style={{ borderLeftWidth: 4, borderLeftColor: style.border }}>
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[11px] font-bold text-[#705E46] tracking-widest uppercase">
                    Order {order.orderNumber || `#${order.id}`}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded tracking-widest uppercase"
                        style={{ backgroundColor: style.bg, color: style.text }}>
                    {order.status}
                  </span>
                </div>
                
                <h4 className="text-[19px] font-bold text-[#422701] mb-6 leading-tight">
                  {order.items?.[0]?.productName || 'Order'}<br/>
                  {order.items?.length > 1 ? `+ ${order.items.length - 1} more` : 'Bundle'}
                </h4>
                
                <div className="flex items-center justify-between border-t border-[#EAE5DF] pt-5 mt-auto">
                  <span className="text-[14px] text-[#705E46]">{date}</span>
                  <span className="text-[16px] font-bold text-[#422701]">
                    ₹{parseFloat(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersCard;
