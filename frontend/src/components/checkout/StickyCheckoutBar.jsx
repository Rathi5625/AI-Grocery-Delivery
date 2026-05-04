import React from 'react';
import { FiLock } from 'react-icons/fi';

export default function StickyCheckoutBar({ total, onPlaceOrder, loading }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.04)] border-t border-[#C6C0B9]/10 z-50">
      <div className="max-w-xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.1em] text-[#705E46] font-semibold mb-0.5">TOTAL TO PAY</p>
          <p className="text-xl font-bold text-[#422701]">₹{total.toFixed(2)}</p>
        </div>
        
        <button 
          onClick={onPlaceOrder}
          disabled={loading}
          className="bg-[#D6B588] hover:bg-[#c9a778] text-[#422701] font-medium py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm text-sm"
        >
          <FiLock size={14} />
          {loading ? 'PROCESSING...' : 'PLACE ORDER'}
        </button>
      </div>
    </div>
  );
}
