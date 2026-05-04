import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiBell, FiFilter, FiDownload, FiBox, FiTrendingDown, FiChevronDown } from 'react-icons/fi';
import Sidebar from '../components/admin/Sidebar';
import InventoryTable from '../components/admin/InventoryTable';
import ReorderModal from '../components/admin/ReorderModal';
import {
  adminGetInventory,
  adminGetInventoryStats,
  adminReorderProduct,
  adminExportInventory,
} from '../api/adminApi';
import toast from 'react-hot-toast';

const LOW_THRESHOLD = 10;

export default function AdminInventoryPage() {

  // ── Data ──────────────────────────────────────────────────
  const [inventory, setInventory]       = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── KPI Stats ─────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalItems:    '—',
    lowStockCount: '—',
    aiSuggestions: '—',
  });

  // ── Pagination ────────────────────────────────────────────
  const [page, setPage]                   = useState(0);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // ── Search & Filter ───────────────────────────────────────
  const [searchTerm, setSearchTerm]   = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // ALL | LOW_STOCK | IN_STOCK
  const [filterOpen, setFilterOpen]   = useState(false);

  // ── Modal ─────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [itemToReorder, setItemToReorder] = useState(null);

  // ── Fetch Stats ───────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await adminGetInventoryStats();
      // axios interceptor already unwraps the ApiResponse envelope
      const d   = res.data ?? {};
      setStats({
        totalItems:    d.totalItems    ?? '—',
        lowStockCount: d.lowStockCount ?? '—',
        aiSuggestions: d.aiSuggestions ?? '—',
      });
    } catch (err) {
      console.error('Stats fetch failed', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch Inventory ───────────────────────────────────────
  const fetchInventory = useCallback(async (
    currentPage   = page,
    currentSearch = searchTerm,
    currentFilter = stockFilter,
  ) => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, size: PAGE_SIZE };
      if (currentSearch.trim())            params.search      = currentSearch.trim();
      if (currentFilter !== 'ALL')         params.stockFilter = currentFilter;

      const res  = await adminGetInventory(params);
      // axios interceptor already unwraps the ApiResponse envelope
      const body = res.data ?? {};

      if (body.content) {
        setInventory(body.content);
        setTotalPages(body.totalPages    ?? 1);
        setTotalElements(body.totalElements ?? body.content.length);
      } else {
        setInventory([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Inventory fetch failed', err);
      toast.error('Failed to load inventory');
      setInventory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Debounced re-fetch on search / filter / page change ───
  useEffect(() => {
    const t = setTimeout(() => fetchInventory(page, searchTerm, stockFilter), 400);
    return () => clearTimeout(t);
  }, [searchTerm, stockFilter, page]);

  // ── Reorder ───────────────────────────────────────────────
  const handleReorderClick = (item) => {
    setItemToReorder(item);
    setIsModalOpen(true);
  };

  const handleConfirmReorder = async (itemId, quantity) => {
    // Optimistic update
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, stock: item.stock + quantity, stockLevel: item.stock + quantity, isLowStock: (item.stock + quantity) <= LOW_THRESHOLD }
          : item
      )
    );
    try {
      await adminReorderProduct(itemId, quantity);
      toast.success('Stock reordered successfully!');
      setIsModalOpen(false);
      // Refresh stats after reorder
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error('Failed to reorder stock');
      fetchInventory(page, searchTerm, stockFilter); // revert
    }
  };

  // ── Export CSV ────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res  = await adminExportInventory();
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Inventory exported!');
    } catch (err) {
      console.error(err);
      toast.error('Export failed');
    }
  };

  // ── Pagination helpers ────────────────────────────────────
  const startItem = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem   = Math.min((page + 1) * PAGE_SIZE, totalElements);

  const FILTER_OPTIONS = [
    { value: 'ALL',       label: 'All Items' },
    { value: 'LOW_STOCK', label: 'Low Stock' },
    { value: 'IN_STOCK',  label: 'In Stock' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex">
      <Sidebar />

      <div className="flex-1 ml-[260px] flex flex-col min-w-0">

        {/* ── Top Header ─────────────────────────────────── */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-[#C6C0B9]/20 bg-[#FAF7F2] sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-[340px]">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]" size={16} />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                className="w-full bg-[#EAE5DB]/60 border-none rounded-full py-2.5 pl-11 pr-4 text-[0.95rem] text-[#422701] placeholder:text-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D6B588] transition-shadow"
              />
            </div>
          </div>

          <div className="flex items-center gap-7">
            <button className="text-[#e28833] hover:text-[#c47125] transition-colors">
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

        {/* ── Main Content ────────────────────────────────── */}
        <main className="flex-1 p-10 overflow-x-hidden w-full max-w-[1300px] mx-auto">

          {/* Page Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-[2.2rem] font-medium text-[#422701] mb-1 tracking-tight">Inventory Management</h1>
              <p className="text-[#705E46] text-[1.05rem]">Monitor and adjust stock levels across all curated goods.</p>
            </div>

            <div className="flex gap-4 relative">
              {/* Filters dropdown */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 bg-[#FDFBF7] border border-[#C6C0B9]/80 rounded-lg px-6 py-2.5 text-[#422701] font-bold shadow-sm hover:bg-[#EAE5DB] transition-colors text-[0.85rem] tracking-wide"
                >
                  <FiFilter size={16} />
                  {stockFilter === 'ALL' ? 'Filters' : FILTER_OPTIONS.find(f => f.value === stockFilter)?.label}
                  <FiChevronDown size={14} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>

                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                    <div className="absolute right-0 top-12 bg-white border border-[#C6C0B9]/40 shadow-xl rounded-xl z-20 overflow-hidden w-40 py-1">
                      {FILTER_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setStockFilter(opt.value); setPage(0); setFilterOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-[0.85rem] font-medium hover:bg-[#FAF7F2] transition-colors ${
                            stockFilter === opt.value ? 'text-[#422701] bg-[#FAF7F2]' : 'text-[#705E46]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-[#FDFBF7] border border-[#C6C0B9]/80 rounded-lg px-6 py-2.5 text-[#422701] font-bold shadow-sm hover:bg-[#EAE5DB] transition-colors text-[0.85rem] tracking-wide"
              >
                <FiDownload size={16} /> Export
              </button>
            </div>
          </div>

          {/* ── Stats Cards ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Items */}
            <div className="bg-[#FDFBF7] rounded-xl p-6 border border-[#C6C0B9]/30 shadow-sm flex flex-col justify-center h-32 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[0.85rem] font-bold text-[#422701] tracking-wide">Total Items</h3>
                <div className="w-8 h-8 rounded-full bg-[#EAE5DB] flex items-center justify-center text-[#705E46]">
                  <FiBox size={14} />
                </div>
              </div>
              <p className={`text-[#422701] text-[2.75rem] font-medium leading-none tracking-tight mt-1 ${statsLoading ? 'animate-pulse' : ''}`}>
                {typeof stats.totalItems === 'number' ? stats.totalItems.toLocaleString() : stats.totalItems}
              </p>
            </div>

            {/* Low Stock */}
            <div className="bg-[#FFF4F4] rounded-xl p-6 border border-[#F5C2C2] shadow-sm flex flex-col justify-center h-32 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[0.85rem] font-bold text-[#D32F2F] tracking-wide flex items-center gap-2">
                  ▲ Low Stock
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#FAD4D4] flex items-center justify-center text-[#D32F2F]">
                  <FiTrendingDown size={14} />
                </div>
              </div>
              <div className="flex items-baseline gap-3 mt-1">
                <p className={`text-[#D32F2F] text-[2.75rem] font-medium leading-none tracking-tight ${statsLoading ? 'animate-pulse' : ''}`}>
                  {stats.lowStockCount}
                </p>
                <span className="text-[#D32F2F] text-[0.85rem] font-medium tracking-wide">Items need attention</span>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-[#FDFBF7] rounded-xl p-6 border border-[#C6C0B9]/30 shadow-sm flex flex-col justify-center h-32 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-[0.85rem] font-bold text-[#422701] tracking-wide">AI Suggestions</h3>
                <div className="w-8 h-8 rounded-full bg-[#F2ECE4] flex items-center justify-center text-[#8A6843]">
                  <span className="text-xl leading-none -mt-1 font-serif">✧</span>
                </div>
              </div>
              <p className={`text-[#422701] text-[2.75rem] font-medium leading-none tracking-tight mt-1 ${statsLoading ? 'animate-pulse' : ''}`}>
                {stats.aiSuggestions}
              </p>
            </div>
          </div>

          {/* ── Inventory Table ──────────────────────────── */}
          {isLoading ? (
            <div className="bg-[#FDFBF7] rounded-xl border border-[#C6C0B9]/30 shadow-sm flex flex-col mt-8 overflow-hidden">
              {/* Skeleton header */}
              <div className="border-b border-[#C6C0B9]/30 bg-[#FAF7F2] px-6 py-4 flex gap-4">
                {['w-[30%]', 'w-[15%]', 'w-[15%]', 'w-[15%]', 'w-[15%]', 'w-[10%]'].map((w, i) => (
                  <div key={i} className={`h-3 ${w} bg-[#EAE5DB] rounded-full animate-pulse`} />
                ))}
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-5 border-b border-[#C6C0B9]/15 flex gap-4 items-center">
                  <div className="w-[30%] flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#EAE5DB] animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#EAE5DB]/70 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-[#EAE5DB]/50 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                  <div className="w-[15%] h-4 bg-[#EAE5DB]/70 rounded animate-pulse" />
                  <div className="w-[15%] h-4 bg-[#EAE5DB]/70 rounded animate-pulse" />
                  <div className="w-[15%] h-6 bg-[#EAE5DB]/70 rounded-full animate-pulse" />
                  <div className="w-[15%] h-4 bg-[#EAE5DB]/70 rounded animate-pulse" />
                  <div className="w-[10%] h-8 bg-[#D6B588]/30 rounded animate-pulse" />
                </div>
              ))}
              {/* Pagination skeleton footer */}
              <div className="px-6 py-4 flex justify-between items-center bg-[#FAF7F2] border-t border-[#C6C0B9]/20">
                <div className="h-3 w-40 bg-[#EAE5DB] rounded animate-pulse" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-lg bg-[#EAE5DB] animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <InventoryTable
              inventory={inventory}
              onReorder={handleReorderClick}
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              startItem={startItem}
              endItem={endItem}
              onPageChange={setPage}
              lowThreshold={LOW_THRESHOLD}
            />
          )}

        </main>
      </div>

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleConfirmReorder}
        item={itemToReorder}
      />
    </div>
  );
}
