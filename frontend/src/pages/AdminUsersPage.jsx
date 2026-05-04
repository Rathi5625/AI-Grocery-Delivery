import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiPlus, FiFilter, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Sidebar from '../components/admin/Sidebar';
import UserCard from '../components/admin/UserCard';
import AddUserModal from '../components/admin/AddUserModal';
import { adminGetUsers, toggleUserStatus, adminCreateUser, adminUpdateUser } from '../api/adminApi';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Search & Filter
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchUsers = async (currentPage = page, currentSearch = searchTerm, currentFilter = filter) => {
    try {
      setIsLoading(true);
      
      const params = {
        page: currentPage,
        size: 10
      };

      if (currentSearch.trim()) params.search = currentSearch.trim();
      if (currentFilter === 'ACTIVE') params.active = true;
      if (currentFilter === 'INACTIVE') params.active = false;

      const res = await adminGetUsers(params);
      
      // Page response — axios interceptor already unwraps ApiResponse envelope
      if (res.data?.content) {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages ?? 1);
        setTotalElements(res.data.totalElements ?? 0);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(page, searchTerm, filter);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filter, page]);

  const handleToggleStatus = async (user) => {
    try {
      // Optimistic update
      setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
      await toggleUserStatus(user.id);
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
      fetchUsers();
    }
  };

  const handleSave = async (userData) => {
    try {
      if (userToEdit) {
        await adminUpdateUser(userToEdit.id, userData);
        toast.success('User updated successfully');
      } else {
        await adminCreateUser(userData);
        toast.success('User added successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(userToEdit ? 'Failed to update user' : 'Failed to add user');
    }
  };

  const openAddModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  // Filter is handled by API now
  const filteredUsers = users;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="flex-1 ml-[260px] flex flex-col min-w-0">
        {/* Top Header */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-[#C6C0B9]/20 bg-[#FAF7F2] sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-[340px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0); // Reset page on search
                }}
                className="w-full bg-[#EAE5DB]/60 border-none rounded-full py-2.5 pl-11 pr-4 text-[0.95rem] text-[#422701] placeholder:text-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D6B588] transition-shadow"
              />
            </div>
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
        <main className="flex-1 p-10 overflow-x-hidden w-full max-w-[1300px] mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-[2.2rem] font-medium text-[#422701] mb-1 tracking-tight">User Management</h1>
              <p className="text-[#705E46] text-[1.05rem]">Manage access, roles, and status for FreshAI curation team.</p>
            </div>
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#D6B588] rounded-xl px-6 py-3.5 text-[#422701] font-bold shadow-sm hover:bg-[#cba878] transition-colors text-[0.95rem] tracking-wide"
            >
              <FiPlus size={18} />
              Add User
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border border-[#C6C0B9]/40 bg-[#FDFBF7] rounded-2xl px-6 py-4 mb-8 shadow-[0_2px_10px_-4px_rgba(198,192,185,0.2)]">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setFilter('ALL');
                  setPage(0);
                }}
                className={`px-6 py-2 rounded-full font-bold text-[0.85rem] transition-colors shadow-sm ${filter === 'ALL' ? 'bg-[#D6B588] text-[#422701]' : 'border border-[#C6C0B9] text-[#705E46] hover:bg-[#EAE5DB]'}`}
              >
                All Users
              </button>
              <button 
                onClick={() => {
                  setFilter('ACTIVE');
                  setPage(0);
                }}
                className={`px-6 py-2 rounded-full font-bold text-[0.85rem] transition-colors ${filter === 'ACTIVE' ? 'bg-[#D6B588] text-[#422701]' : 'border border-[#C6C0B9] text-[#705E46] hover:bg-[#EAE5DB]'}`}
              >
                Active
              </button>
              <button 
                onClick={() => {
                  setFilter('INACTIVE');
                  setPage(0);
                }}
                className={`px-6 py-2 rounded-full font-bold text-[0.85rem] transition-colors ${filter === 'INACTIVE' ? 'bg-[#D6B588] text-[#422701]' : 'border border-[#C6C0B9] text-[#705E46] hover:bg-[#EAE5DB]'}`}
              >
                Inactive
              </button>
              <button className="px-6 py-2 rounded-full border border-[#C6C0B9] text-[#705E46] font-medium text-[0.85rem] hover:bg-[#EAE5DB] transition-colors flex items-center gap-2">
                <FiFilter size={14} /> More Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#705E46] text-[0.85rem]">Sort by:</span>
              <button className="text-[#422701] font-bold text-[0.85rem] flex items-center gap-1 hover:opacity-70 transition-opacity">
                Date Added <FiChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="p-10 flex justify-center"><div className="w-8 h-8 border-4 border-[#D6B588] border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            <div>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    onToggleStatus={handleToggleStatus} 
                    onClick={handleEdit} 
                  />
                ))
              ) : (
                <div className="py-12 text-center text-[#705E46]">No users found matching the filter.</div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 mb-4 px-2">
              <span className="text-[#705E46] text-[0.85rem] font-medium">
                Showing {page * 10 + 1}-{Math.min((page + 1) * 10, totalElements)} of {totalElements} users
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#C6C0B9]/60 text-[#705E46] hover:bg-[#EAE5DB] transition-colors bg-[#FDFBF7] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-colors shadow-sm ${
                      page === idx 
                      ? 'bg-[#D6B588] text-[#422701]' 
                      : 'border border-[#C6C0B9]/60 text-[#705E46] hover:bg-[#EAE5DB] bg-[#FDFBF7]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#C6C0B9]/60 text-[#705E46] hover:bg-[#EAE5DB] transition-colors bg-[#FDFBF7] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      <AddUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        user={userToEdit} 
      />
    </div>
  );
}
