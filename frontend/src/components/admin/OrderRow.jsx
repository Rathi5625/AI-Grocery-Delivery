import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderRow({ order, onStatusChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':   return 'bg-[#EBDBC0] text-[#705E46]';
      case 'CONFIRMED': return 'bg-[#D6EBD0] text-[#3D6B35]';
      case 'DELIVERED': return 'bg-[#EAE5DB] text-[#705E46]';
      case 'CANCELLED': return 'bg-[#F0E0DC] text-[#8B4242]';
      case 'REFUNDED':  return 'bg-[#E5E0F0] text-[#5B4B8A]';
      default:          return 'bg-[#EAE5DB] text-[#705E46]';
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':   return 'bg-[#A88C64]';
      case 'CONFIRMED': return 'bg-[#5A9A52]';
      case 'DELIVERED': return 'bg-[#9CA8B8]';
      case 'CANCELLED': return 'bg-[#C47A7A]';
      case 'REFUNDED':  return 'bg-[#9B8AC4]';
      default:          return 'bg-gray-400';
    }
  };

  // Support both old dummy-data field names AND the real API field names
  const orderId       = order.orderNumber || order.orderId || `ORD-${order.id}`;
  const customerName  = order.customerName
    || `${order.customerFirstName ?? ''} ${order.customerLastName ?? ''}`.trim()
    || 'Unknown';
  const initials = customerName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .slice(0, 2)
    .join('');

  const total = order.totalAmount ?? order.total ?? 0;

  // Format createdAt from ISO string → "Today, 10:42 AM" or "Apr 28, 09:15 AM"
  const formatDate = (isoStr) => {
    if (!isoStr) return order.dateFormatted ?? '—';
    const d = new Date(isoStr);
    const today = new Date();
    const isToday =
      d.getDate()    === today.getDate()    &&
      d.getMonth()   === today.getMonth()   &&
      d.getFullYear() === today.getFullYear();
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday =
      d.getDate()    === yesterday.getDate()    &&
      d.getMonth()   === yesterday.getMonth()   &&
      d.getFullYear() === yesterday.getFullYear();
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + `, ${timeStr}`;
  };

  const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

  const handleStatusSelect = (newStatus) => {
    setIsDropdownOpen(false);
    onStatusChange(order.id, newStatus);
  };

  return (
    <tr className="border-b border-[#C6C0B9]/20 hover:bg-[#FAF7F2]/50 transition-colors group bg-[#FDFBF7]">
      {/* Order ID */}
      <td className="py-5 px-6">
        <button className="text-[#a07a4e] font-medium hover:underline transition-all tracking-wide">
          #{orderId}
        </button>
      </td>

      {/* Customer */}
      <td className="py-5 px-6">
        <div className="flex items-center gap-3 pl-1">
          <div className="w-[34px] h-[34px] rounded-full bg-[#EAE5DB] flex items-center justify-center text-[#422701] font-bold text-[0.8rem] shrink-0 shadow-sm">
            {initials || 'C'}
          </div>
          <span className="text-[#422701] font-medium tracking-wide">{customerName}</span>
        </div>
      </td>

      {/* Date & Time */}
      <td className="py-5 px-6 text-[#422701]">
        {formatDate(order.createdAt)}
      </td>

      {/* Status — click to open dropdown */}
      <td className="py-5 px-6 relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.75rem] font-bold tracking-wider transition-all hover:opacity-80 shadow-sm ${getStatusStyle(order.status)}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`} />
          {order.status
            ? order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()
            : 'Pending'}
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-12 left-6 bg-white border border-[#C6C0B9]/40 shadow-xl rounded-xl z-20 overflow-hidden w-40 py-1"
              >
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusSelect(s)}
                    className={`w-full text-left px-4 py-2.5 text-[0.85rem] font-medium hover:bg-[#FAF7F2] flex items-center gap-2 transition-colors ${
                      order.status?.toUpperCase() === s ? 'text-[#422701] bg-[#FAF7F2]' : 'text-[#705E46]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(s)}`} />
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </td>

      {/* Total */}
      <td className="py-5 px-6 text-[#422701] text-[1.05rem] tracking-wide">
        ₹{Number(total).toFixed(2)}
      </td>
    </tr>
  );
}
