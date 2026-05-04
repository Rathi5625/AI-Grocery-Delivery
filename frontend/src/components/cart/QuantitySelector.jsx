import React from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';

export default function QuantitySelector({ quantity, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#C6C0B9]/20">
      <button 
        onClick={quantity <= 1 ? onRemove : onDecrease}
        className="text-[#705E46] hover:text-[#422701] transition-colors p-1"
      >
        <FiMinus size={14} />
      </button>
      <span className="text-[#422701] font-medium w-4 text-center text-sm">{quantity}</span>
      <button 
        onClick={onIncrease}
        className="text-[#705E46] hover:text-[#422701] transition-colors p-1"
      >
        <FiPlus size={14} />
      </button>
    </div>
  );
}
