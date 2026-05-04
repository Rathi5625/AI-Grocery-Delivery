import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function AddProductModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product.categoryId || '',
        price: product.price || '',
        stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : '',
        imageUrl: product.imageUrl || '',
        description: product.description || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
    } else {
      setFormData({
        name: '', categoryId: '', price: '', stockQuantity: '', imageUrl: '', description: '', isActive: true,
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      categoryId: parseInt(formData.categoryId, 10) || null,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#FDFBF7] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[#C6C0B9]/30"
        >
          <div className="px-8 py-6 border-b border-[#C6C0B9]/20 flex justify-between items-center bg-[#FDFBF7]">
            <h3 className="text-xl font-bold text-[#422701] tracking-wide">{product ? 'Edit Product' : 'Add New Product'}</h3>
            <button onClick={onClose} className="text-[#705E46] hover:text-[#422701] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAE5DB]">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="e.g. Organic Avocados" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Category ID</label>
                <input required type="number" name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="e.g. 1" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Price ($)</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="0.00" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Stock Quantity</label>
                <input required type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="e.g. 50" />
              </div>
              <div className="col-span-2">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Image URL</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Description</label>
                <textarea rows="3" name="description" value={formData.description} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white resize-none" placeholder="Brief description..."></textarea>
              </div>
              <div className="col-span-2 flex items-center gap-3 mt-2">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-[#D6B588] focus:ring-[#D6B588] border-gray-300 accent-[#D6B588]" />
                <label htmlFor="isActive" className="text-[#422701] font-bold text-[0.95rem] cursor-pointer">Product is active and visible to customers</label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#C6C0B9]/20">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-[#705E46] font-bold hover:bg-[#EAE5DB] transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-8 py-3 rounded-xl bg-[#D6B588] text-[#422701] font-bold shadow-sm hover:bg-[#cba878] transition-colors">
                {product ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
