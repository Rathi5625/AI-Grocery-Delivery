import React, { useState } from 'react';

const QuantitySelector = ({ initial = 1, min = 1, max = 10, onChange }) => {
  const [qty, setQty] = useState(initial);

  const handleDecrease = () => {
    if (qty > min) {
      setQty(qty - 1);
      if (onChange) onChange(qty - 1);
    }
  };

  const handleIncrease = () => {
    if (qty < max) {
      setQty(qty + 1);
      if (onChange) onChange(qty + 1);
    }
  };

  return (
    <div className="flex items-center justify-between w-32 border border-[#C6C0B9] rounded-lg py-1.5 px-2 bg-white/50 backdrop-blur-sm">
      <button 
        onClick={handleDecrease}
        disabled={qty <= min}
        className="w-8 h-8 flex items-center justify-center text-[#422701] hover:bg-[#C6C0B9]/20 rounded transition-colors disabled:opacity-40 focus:outline-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      <span className="text-[15px] font-medium text-[#422701]">{qty}</span>
      <button 
        onClick={handleIncrease}
        disabled={qty >= max}
        className="w-8 h-8 flex items-center justify-center text-[#422701] hover:bg-[#C6C0B9]/20 rounded transition-colors disabled:opacity-40 focus:outline-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><line x1="12" y1="5" x2="12" y2="19"></line></svg>
      </button>
    </div>
  );
};

export default QuantitySelector;
