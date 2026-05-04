import React from 'react';
import { FiCheck, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function SuccessCard({ orderId = '#FAI-89247', estDelivery = '~30 mins' }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-10 md:p-12 w-full text-center border border-[#C6C0B9]/20">

      {/* Icon */}
      <div className="mx-auto w-20 h-20 bg-[#D6B588] rounded-full flex items-center justify-center mb-6">
        <div className="w-9 h-9 bg-[#422701] rounded-full flex items-center justify-center">
          <FiCheck className="text-[#D6B588]" size={18} strokeWidth={3.5} />
        </div>
      </div>

      {/* Text */}
      <h1 className="text-[1.7rem] font-medium text-[#422701] mb-2.5 leading-tight tracking-tight">
        Order placed<br />successfully!
      </h1>
      <p className="text-[#705E46] text-[0.95rem] mb-8">
        Your curated selections are being prepared.
      </p>

      {/* Details Box */}
      <div className="bg-[#F2ECE4] rounded-xl px-5 py-4 mb-8 text-left space-y-3.5">
        <div className="flex justify-between items-center">
          <span className="text-[0.7rem] uppercase tracking-widest text-[#705E46] font-medium">Order ID</span>
          <span className="text-[0.85rem] font-bold text-[#422701] tracking-wide">{orderId}</span>
        </div>
        <div className="border-t border-[#C6C0B9]/30"></div>
        <div className="flex justify-between items-center">
          <span className="text-[0.7rem] uppercase tracking-widest text-[#705E46] font-medium">Est. Delivery</span>
          <span className="text-[0.85rem] font-bold text-[#422701] flex items-center gap-1.5">
            <FiClock size={13} className="text-[#422701]" /> {estDelivery}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Link
          to="/shop"
          className="block w-full py-3.5 bg-[#D6B588] hover:bg-[#c9a778] text-[#422701] rounded-xl font-medium transition-colors shadow-sm text-[0.95rem]"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="block w-full py-2 text-[#705E46] hover:text-[#422701] font-medium transition-colors text-[0.9rem]"
        >
          Track Order
        </Link>
      </div>

    </div>
  );
}
