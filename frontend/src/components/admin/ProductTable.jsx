import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ProductTable({ products, onEdit, onDelete }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#C6C0B9]/40 p-16 flex flex-col items-center justify-center text-center mt-6 min-h-[300px]">
        <div className="w-16 h-16 bg-[#422701] rounded-xl flex items-center justify-center mb-6 text-white shadow-md">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <p className="text-[#422701] font-medium text-lg tracking-wide">No products found.</p>
        <p className="text-[#705E46] mt-2">Click "Add Product" to add items to your inventory.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(198,192,185,0.3)] border border-[#C6C0B9]/30 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#C6C0B9]/30">
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase">Image</th>
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase">Name</th>
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase">Category</th>
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase">Price</th>
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase">Stock</th>
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase">Status</th>
              <th className="py-4 px-6 text-[#705E46] font-bold text-[0.8rem] tracking-wider uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={`border-b border-[#C6C0B9]/10 transition-colors ${product.stockQuantity < 10 ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-[#FAF7F2]/60'}`}>
                <td className="py-4 px-6">
                  <div className="w-14 h-14 rounded-xl bg-[#EAE5DB] overflow-hidden shadow-sm">
                    <img src={product.imageUrl || 'https://placehold.co/100x100?text=No+Img'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </td>
                <td className="py-4 px-6">
                  <p className="text-[#422701] font-bold text-[0.95rem]">{product.name}</p>
                  <p className="text-[#705E46] text-xs mt-1 max-w-[200px] truncate">{product.description || 'No description available'}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="bg-[#F2ECE4] text-[#705E46] px-3.5 py-1.5 rounded-full text-[0.75rem] font-bold tracking-wide">
                    {product.categoryName || 'General'}
                  </span>
                </td>
                <td className="py-4 px-6 text-[#422701] font-bold text-[1.05rem]">
                  ₹{Number(product.price).toFixed(2)}
                </td>
                <td className="py-4 px-6">
                  <span className={`font-bold text-[0.95rem] ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity < 10 ? 'text-[#e28833]' : 'text-[#422701]'}`}>
                    {product.stockQuantity}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5 items-start">
                    <span className={`flex items-center gap-1.5 text-[0.75rem] font-bold tracking-wider px-2 py-0.5 rounded-md ${product.isActive !== false ? 'bg-[#eefcf2] text-[#16a34a]' : 'bg-gray-100 text-[#9ca3af]'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${product.isActive !== false ? 'bg-[#16a34a]' : 'bg-[#9ca3af]'}`}></span>
                      {product.isActive !== false ? 'ACTIVE' : 'DRAFT'}
                    </span>
                    {product.stockQuantity < 10 && (
                      <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-md text-[0.7rem] font-bold tracking-wider uppercase">
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-2.5">
                    <button onClick={() => onEdit(product)} className="w-9 h-9 rounded-xl bg-[#F2ECE4] text-[#705E46] flex items-center justify-center hover:bg-[#D6B588] hover:text-[#422701] transition-all shadow-sm hover:shadow">
                      <FiEdit2 size={15} />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="w-9 h-9 rounded-xl bg-[#F2ECE4] text-[#705E46] flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all shadow-sm hover:shadow">
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
