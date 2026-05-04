import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import Sidebar from '../components/admin/Sidebar';
import ProductTable from '../components/admin/ProductTable';
import AddProductModal from '../components/admin/AddProductModal';
import { adminGetProducts, adminDeleteProduct, adminCreateProduct, adminUpdateProduct } from '../api/adminApi';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {

  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async (search = '') => {
    try {
      setIsLoading(true);
      const res = await adminGetProducts(search);
      // Extract array robustly in case API returns paginated data or direct array
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : (res.data?.content || res.data?.data || []);
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminDeleteProduct(id);
      toast.success('Product deleted successfully');
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete product');
    }
  };

  const handleSave = async (productData) => {
    try {
      if (productToEdit) {
        await adminUpdateProduct(productToEdit.id, productData);
        toast.success('Product updated successfully');
      } else {
        await adminCreateProduct(productData);
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error(productToEdit ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const openAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-[#C6C0B9]/20 bg-[#FAF7F2] sticky top-0 z-10">
          <h2 className="text-[1.3rem] font-bold text-[#422701] tracking-wide">Products</h2>
          
          <div className="relative w-[340px] absolute left-1/2 -translate-x-1/2 hidden md:block">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#EAE5DB]/60 border-none rounded-full py-2.5 pl-11 pr-4 text-[0.95rem] text-[#422701] placeholder:text-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D6B588] transition-shadow"
            />
          </div>
          
          <div className="flex items-center gap-7">
            <button className="text-[#422701] hover:text-[#e28833] transition-colors relative">
              <FiBell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="w-5 h-5 rounded-full bg-[#422701] text-white flex items-center justify-center hover:bg-[#e28833] transition-colors">
              <span className="text-[11px] font-bold">?</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-[#C6C0B9]/30">
               {/* Default avatar for admin */}
               <div className="w-4 h-4 bg-white/20 rounded-full mt-2" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-10 overflow-x-hidden">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-[2.2rem] font-medium text-[#422701] mb-1 tracking-tight">Product Inventory</h1>
              <p className="text-[#705E46] text-[1.05rem]">Manage your curated organic selection.</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#D6B588] rounded-xl px-6 py-3.5 text-[#422701] font-bold shadow-sm hover:bg-[#cba878] transition-colors text-[0.95rem] tracking-wide"
            >
              <FiPlus size={18} />
              Add Product
            </button>
          </div>

          {/* Product Table & Empty State fallback */}
          {isLoading ? (
            <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#D6B588] border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        product={productToEdit} 
      />
    </div>
  );
}
