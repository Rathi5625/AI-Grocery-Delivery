import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop';

export default function InventoryTable({
  inventory,
  onReorder,
  page,
  totalPages,
  totalElements,
  startItem,
  endItem,
  onPageChange,
  lowThreshold = 10,
}) {

  const isLow = (item) =>
    item.isLowStock === true || (item.stock ?? item.stockLevel ?? 0) <= lowThreshold;

  const getStock = (item) => item.stock ?? item.stockLevel ?? 0;

  const getStatusBadge = (item) => {
    const low = isLow(item);
    return low ? (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-wider bg-[#FCE8E8] text-[#D32F2F] shadow-sm w-fit border border-[#F5C2C2]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]" /> Low Stock
      </span>
    ) : (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-wider bg-[#F2ECE4] text-[#705E46] shadow-sm w-fit border border-[#EAE5DB]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#8A6843]" /> In Stock
      </span>
    );
  };

  const getProgressBar = (item) => {
    const stock      = getStock(item);
    const low        = isLow(item);
    const threshold  = item.threshold ?? lowThreshold;
    // Scale: full bar = 5× threshold (or at least 100)
    const maxBar     = Math.max(threshold * 5, 100);
    const percentage = Math.min((stock / maxBar) * 100, 100);

    return (
      <div className="flex items-center gap-3 w-36">
        <span className={`font-bold text-[0.95rem] w-8 text-right tabular-nums ${low ? 'text-[#D32F2F]' : 'text-[#422701]'}`}>
          {stock}
        </span>
        <div className="h-1.5 flex-1 bg-[#EAE5DB] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-in-out ${low ? 'bg-[#D32F2F]' : 'bg-[#8A6843]'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  if (!inventory || inventory.length === 0) {
    return (
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#C6C0B9]/40 shadow-sm flex flex-col items-center justify-center py-24 mt-8">
        <p className="text-[#705E46] text-lg font-medium">No inventory items found</p>
        <p className="text-[#A89F91] text-sm mt-1">Try adjusting your search or filter</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] rounded-xl border border-[#C6C0B9]/30 shadow-[0_2px_10px_-4px_rgba(198,192,185,0.2)] overflow-hidden flex flex-col mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#C6C0B9]/30 bg-[#FAF7F2]">
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[30%]">Product</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[15%]">Category</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[15%]">SKU</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[15%]">Status</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[15%]">Stock Level</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, idx) => {
              const low   = isLow(item);
              const stock = getStock(item);
              return (
                <tr
                  key={item.id || idx}
                  className={`border-b border-[#C6C0B9]/20 hover:bg-[#FAF7F2]/50 transition-colors group ${low ? 'bg-[#FFF8F8]' : 'bg-[#FDFBF7]'}`}
                >
                  {/* Product */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl || DEFAULT_IMAGE}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#C6C0B9]/40 shadow-sm"
                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#422701] font-bold tracking-wide text-[0.95rem]">{item.name}</span>
                          {low && (
                            <div className="w-4 h-4 rounded-full bg-[#D32F2F] text-white flex items-center justify-center font-bold text-[0.6rem]">!</div>
                          )}
                        </div>
                        <span className="text-[#705E46] text-[0.8rem] block mt-0.5">{item.subtitle || item.category}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-5 px-6 text-[#705E46] text-[0.95rem]">{item.category}</td>

                  {/* SKU */}
                  <td className="py-5 px-6 font-mono text-[#705E46] text-[0.85rem] tracking-wide">
                    {item.sku || item.slug || `SKU-${item.id}`}
                  </td>

                  {/* Status */}
                  <td className="py-5 px-6">{getStatusBadge(item)}</td>

                  {/* Stock Level */}
                  <td className="py-5 px-6">{getProgressBar(item)}</td>

                  {/* Actions */}
                  <td className="py-5 px-6">
                    {low && (
                      <button
                        onClick={() => onReorder(item)}
                        className="bg-[#D6B588] text-[#422701] font-bold text-[0.75rem] px-4 py-2 rounded shadow-sm hover:bg-[#cba878] transition-colors whitespace-nowrap"
                      >
                        Reorder
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Footer ─────────────────────────── */}
      <div className="px-6 py-4 flex justify-between items-center bg-[#FAF7F2] border-t border-[#C6C0B9]/20">
        <span className="text-[#705E46] text-[0.85rem]">
          Showing {startItem} to {endItem} of {totalElements} entries
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="text-[#705E46] hover:text-[#422701] transition-colors p-1 mr-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronLeft size={16} />
            </button>

            {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
              // Smart page window around current page
              let pageNum = idx;
              if (totalPages > 5) {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                pageNum = start + idx;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-[#EAE5DB] text-[#422701] font-bold shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                      : 'text-[#705E46] hover:bg-[#EAE5DB]'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            {totalPages > 5 && (
              <span className="px-2 text-[#705E46] tracking-widest text-sm">...</span>
            )}

            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="text-[#705E46] hover:text-[#422701] transition-colors p-1 ml-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
