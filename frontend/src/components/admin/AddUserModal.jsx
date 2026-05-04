import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function AddUserModal({ isOpen, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'CURATOR',
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'CURATOR',
        isActive: user.isActive !== false,
      });
    } else {
      setFormData({
        firstName: '', lastName: '', email: '', role: 'CURATOR', isActive: true,
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#FDFBF7] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#C6C0B9]/30"
        >
          <div className="px-8 py-6 border-b border-[#C6C0B9]/20 flex justify-between items-center bg-[#FDFBF7]">
            <h3 className="text-xl font-bold text-[#422701] tracking-wide">{user ? 'Edit User' : 'Add New User'}</h3>
            <button onClick={onClose} className="text-[#705E46] hover:text-[#422701] transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EAE5DB]">
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="col-span-1">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">First Name</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="e.g. Eleanor" />
              </div>
              <div className="col-span-1">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Last Name</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="e.g. Vance" />
              </div>
              <div className="col-span-2">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white" placeholder="eleanor@freshai.co" />
              </div>
              <div className="col-span-2">
                <label className="block text-[0.8rem] font-bold text-[#705E46] mb-2 uppercase tracking-wide">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#EAE5DB]/50 border border-transparent focus:border-[#D6B588] rounded-xl px-4 py-3 outline-none text-[#422701] font-medium transition-colors focus:bg-white cursor-pointer">
                  <option value="ADMIN">Admin</option>
                  <option value="CURATOR">Curator</option>
                  <option value="ANALYST">Analyst</option>
                </select>
              </div>
              <div className="col-span-2 flex items-center gap-3 mt-2">
                <input type="checkbox" id="isActiveUser" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded text-[#D6B588] focus:ring-[#D6B588] border-gray-300 accent-[#D6B588]" />
                <label htmlFor="isActiveUser" className="text-[#422701] font-bold text-[0.95rem] cursor-pointer">User is active and can log in</label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#C6C0B9]/20">
              <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-[#705E46] font-bold hover:bg-[#EAE5DB] transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-8 py-3 rounded-xl bg-[#D6B588] text-[#422701] font-bold shadow-sm hover:bg-[#cba878] transition-colors">
                {user ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
