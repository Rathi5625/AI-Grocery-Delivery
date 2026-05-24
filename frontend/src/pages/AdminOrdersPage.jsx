import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiBell, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Sidebar from '../components/admin/Sidebar';
import OrderTable from '../components/admin/OrderTable';
import { adminGetOrders, adminGetOrderStats, adminPatchStatus } from '../api/adminApi';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  // ── States ────────────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | DELIVERED
  const PAGE_SIZE = 10;

  // ── Debounce Search ───────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 450);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Stats KPI Query ────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'orderStats'],
    queryFn: async () => {
      const res = await adminGetOrderStats();
      return res.data ?? {};
    },
    staleTime: 30000,
  });

  const stats = {
    todayOrders: statsData?.todayOrders ?? '—',
    pendingOrders: statsData?.pendingOrders ?? '—',
    aiCurationRate: statsData?.aiCurationRate != null ? `${statsData.aiCurationRate}%` : '—',
  };

  // ── Orders Query ──────────────────────────────────────────
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin', 'orders', { page, searchTerm: debouncedSearch, filter }],
    queryFn: async () => {
      const params = { page, size: PAGE_SIZE };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filter !== 'ALL') params.status = filter;
      const res = await adminGetOrders(params);
      return res.data ?? {};
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });

  const orders = ordersData?.content || [];
  const totalPages = ordersData?.totalPages ?? 1;
  const totalElements = ordersData?.totalElements ?? 0;

  // ── Status mutation ───────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const res = await adminPatchStatus(orderId, newStatus);
      return res.data;
    },
    onMutate: async ({ orderId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'orders'] });
      const queryKey = ['admin', 'orders', { page, searchTerm: debouncedSearch, filter }];
      const previousOrders = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map(o => o.id === orderId ? { ...o, status: newStatus } : o),
        };
      });
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ['admin', 'orders', { page, searchTerm: debouncedSearch, filter }],
          context.previousOrders
        );
      }
      toast.error('Failed to update order status');
    },
    onSuccess: (data, variables) => {
      toast.success(`Order status → ${variables.newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['admin', 'orderStats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, newStatus });
  };

  const handleFilter = (newFilter) => {
    setFilter(newFilter);
    setPage(0);
  };

  // ── Pagination helpers ────────────────────────────────────
  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="flex-1 ml-[260px] flex flex-col min-w-0">

        {/* ── Top Header ───────────────────────────────── */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-[#C6C0B9]/20 bg-[#FAF7F2] sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-[340px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]" size={16} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full bg-[#EAE5DB]/60 border-none rounded-full py-2.5 pl-11 pr-4 text-[0.95rem] text-[#422701] placeholder:text-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D6B588] transition-shadow"
              />
            </div>
          </div>

          <div className="flex items-center gap-7">
            <button className="text-[#e28833] hover:text-[#c47125] transition-colors relative">
              <FiBell size={20} />
            </button>
            <button className="text-[#e28833] hover:text-[#c47125] transition-colors">
              <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                <span className="text-[11px] font-bold">?</span>
              </div>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-[#C6C0B9]/30">
              <div className="w-4 h-4 bg-white/20 rounded-full mt-2" />
            </div>
          </div>
        </header>

        {/* ── Dashboard Content ─────────────────────── */}
        <main className="flex-1 p-10 overflow-x-hidden w-full max-w-[1300px] mx-auto">

          {/* Page Header + Filter Pills */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-[2.2rem] font-medium text-[#422701] mb-1 tracking-tight">Order Management</h1>
              <p className="text-[#705E46] text-[1.05rem]">Monitor and process incoming AI-curated grocery orders.</p>
            </div>

            {/* Filter Pills */}
            <div className="bg-[#EAE5DB] rounded-full p-1 flex items-center shadow-inner h-11">
              {['ALL', 'PENDING', 'DELIVERED'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  className={`px-6 py-1.5 rounded-full text-[0.85rem] font-bold transition-all h-full flex items-center ${
                    filter === f
                      ? 'bg-[#FDFBF7] text-[#422701] shadow-[0_1px_3px_rgba(0,0,0,0.05)]'
                      : 'text-[#705E46] hover:text-[#422701]'
                  }`}
                >
                  {f === 'ALL' ? 'All Orders' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* ── Stats Cards ───────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#FDFBF7] rounded-xl p-6 border border-[#C6C0B9]/30 shadow-sm flex flex-col justify-center h-32">
              <h3 className="text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] mb-3">Today's Orders</h3>
              <p className={`text-[#8A6843] text-[2.75rem] font-medium leading-none tracking-tight ${statsLoading ? 'animate-pulse' : ''}`}>
                {stats.todayOrders}
              </p>
            </div>
            <div className="bg-[#FDFBF7] rounded-xl p-6 border border-[#C6C0B9]/30 shadow-sm flex flex-col justify-center h-32">
              <h3 className="text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] mb-3">Pending Fulfillment</h3>
              <p className={`text-[#8A6843] text-[2.75rem] font-medium leading-none tracking-tight ${statsLoading ? 'animate-pulse' : ''}`}>
                {stats.pendingOrders}
              </p>
            </div>
            <div className="bg-[#EBDBC0] rounded-xl p-6 shadow-sm border border-[#D6B588]/20 flex flex-col justify-center h-32">
              <h3 className="text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] mb-3">AI Curation Rate</h3>
              <p className={`text-[#8A6843] text-[2.75rem] font-medium leading-none tracking-tight ${statsLoading ? 'animate-pulse' : ''}`}>
                {stats.aiCurationRate}
              </p>
            </div>
          </div>

          {/* ── Order Table ───────────────────────────── */}
          {isLoading ? (
            <div className="bg-[#FDFBF7] rounded-xl border border-[#C6C0B9]/30 shadow-sm flex flex-col mt-8 overflow-hidden">
              {/* Skeleton header */}
              <div className="border-b border-[#C6C0B9]/30 bg-[#FAF7F2] px-6 py-4 flex gap-6">
                {['w-[15%]', 'w-[25%]', 'w-[25%]', 'w-[20%]', 'w-[15%]'].map((w, i) => (
                  <div key={i} className={`h-3 ${w} bg-[#EAE5DB] rounded-full animate-pulse`} />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-5 border-b border-[#C6C0B9]/15 flex gap-6 items-center">
                  <div className="w-[15%] h-4 bg-[#EAE5DB]/70 rounded animate-pulse" />
                  <div className="w-[25%] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#EAE5DB] animate-pulse shrink-0" />
                    <div className="h-4 flex-1 bg-[#EAE5DB]/70 rounded animate-pulse" />
                  </div>
                  <div className="w-[25%] h-4 bg-[#EAE5DB]/70 rounded animate-pulse" />
                  <div className="w-[20%] h-6 bg-[#EAE5DB]/70 rounded-full animate-pulse" />
                  <div className="w-[15%] h-4 bg-[#EAE5DB]/70 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <OrderTable orders={orders} onStatusChange={handleStatusChange} />
          )}

          {/* ── Pagination ────────────────────────────── */}
          {!isLoading && totalElements > 0 && (
            <div className="flex items-center justify-between mt-6 px-2">
              <span className="text-[#705E46] text-[0.85rem] font-medium">
                Showing {startItem}–{endItem} of {totalElements} orders
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#C6C0B9]/60 text-[#705E46] hover:bg-[#EAE5DB] bg-[#FDFBF7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-colors ${
                        page === idx
                          ? 'bg-[#D6B588] text-[#422701] shadow-sm'
                          : 'border border-[#C6C0B9]/60 text-[#705E46] hover:bg-[#EAE5DB] bg-[#FDFBF7]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#C6C0B9]/60 text-[#705E46] hover:bg-[#EAE5DB] bg-[#FDFBF7] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
