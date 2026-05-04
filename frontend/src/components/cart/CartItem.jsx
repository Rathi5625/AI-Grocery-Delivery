import React, { useState } from 'react';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const [updating, setUpdating] = useState(false);

  const handleDecrease = async () => {
    if (updating) return;
    if (item.quantity <= 1) {
      onRemove(item.id);
      return;
    }
    setUpdating(true);
    await onUpdateQuantity(item.id, item.quantity - 1);
    setUpdating(false);
  };

  const handleIncrease = async () => {
    if (updating) return;
    setUpdating(true);
    await onUpdateQuantity(item.id, item.quantity + 1);
    setUpdating(false);
  };

  const imageUrl = item.productImage || null;
  const totalPrice = Number(item.totalPrice ?? (Number(item.unitPrice) * item.quantity) ?? 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, margin: 0, overflow: 'hidden' }}
      className="flex flex-col sm:flex-row sm:items-center p-4 bg-[#F2ECE4] rounded-2xl shadow-sm mb-4 gap-4"
    >
      {/* Image + Name */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#E5DFD7] flex items-center justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">🥦</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#422701] truncate">{item.productName}</h3>
          <p className="text-sm text-[#705E46] mt-0.5">{item.productUnit || 'Standard pack'}</p>
          {item.unitPrice && (
            <p className="text-xs text-[#C6C0B9] mt-0.5">₹{Number(item.unitPrice).toFixed(2)} each</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
        {/* Quantity selector */}
        <div className={`flex items-center gap-3 bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#C6C0B9]/20 transition-opacity ${updating ? 'opacity-50' : ''}`}>
          <button
            onClick={handleDecrease}
            disabled={updating}
            className="text-[#705E46] hover:text-[#422701] transition-colors p-1 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <FiMinus size={14} />
          </button>
          <span className="text-[#422701] font-medium w-5 text-center text-sm">
            {updating ? '…' : item.quantity}
          </span>
          <button
            onClick={handleIncrease}
            disabled={updating}
            className="text-[#705E46] hover:text-[#422701] transition-colors p-1 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <FiPlus size={14} />
          </button>
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-[#422701] min-w-[70px] text-right">
          ₹{totalPrice.toFixed(2)}
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          className="text-[#C6C0B9] hover:text-[#422701] transition-colors p-2 shrink-0"
          aria-label="Remove item"
        >
          <FiTrash2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}
