import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function ReorderModal({ isOpen, onClose, onSave, item }) {
  const [quantity, setQuantity] = useState(50);

  // Reset quantity when a different item is opened
  useEffect(() => {
    if (isOpen) setQuantity(50);
  }, [isOpen, item?.id]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) return;
    onSave(item.id, qty);
  };

  // Support both old (stockLevel) and new API (stock) field names
  const currentStock = item?.stock ?? item?.stockLevel ?? 0;
  const productName  = item?.name ?? 'Unknown Product';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#FDFBF7] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#C6C0B9]/30"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-[#C6C0B9]/20 flex justify-between items-center bg-[#FDFBF7]">
            <h3 className="text-xl font-bold text-[#422701] tracking-wide">Reorder Stock</h3>
            <button
              onClick={onClose}
              className="text-[#705E46] hover:text-[#422701] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAE5DB]"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Product info */}
            <div className="mb-6 bg-[#FFF8F8] border border-[#F5C2C2] rounded-xl p-4">
              <p className="text-[#422701] font-bold mb-0.5">{productName}</p>
              <p className="text-[#705E46] text-sm">
                Current stock:{' '}
                <span className="font-bold text-[#D32F2F]">{currentStock} units</span>
              </p>
              {item?.category && (
                <p className="text-[#A89F91] text-xs mt-1">{item.category}</p>
              )}
            </div>

            {/* Quantity presets */}
            <div className="mb-4">
              <label className="block text-[0.8rem] font-bold text-[#705E46] mb-3 uppercase tracking-wide">
                Quantity to Add
              </label>
              <div className="flex gap-2 mb-3">
                {[25, 50, 100, 200].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`flex-1 py-2 rounded-lg text-[0.8rem] font-bold transition-colors border ${
                      quantity === preset
                        ? 'bg-[#D6B588] text-[#422701] border-[#D6B588]'
                        : 'bg-[#EAE5DB]/50 text-[#705E46] border-transparent hover:bg-[#EAE5DB]'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
              <input
                required
                type="number"
                min="1"
                max="9999"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white"
              />
            </div>

            {/* After reorder preview */}
            <p className="text-[#705E46] text-sm">
              New stock after reorder:{' '}
              <span className="font-bold text-[#422701]">
                {currentStock + (parseInt(quantity, 10) || 0)} units
              </span>
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#C6C0B9]/20">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl text-[#705E46] font-bold hover:bg-[#EAE5DB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-[#D6B588] text-[#422701] font-bold shadow-sm hover:bg-[#cba878] transition-colors"
              >
                Confirm Reorder
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
