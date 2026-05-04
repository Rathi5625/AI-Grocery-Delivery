import React from 'react';

const FilterSidebar = ({ activeCategory, onCategoryChange, searchQuery, onSearchChange, categories = [] }) => {
  const ALL_CATEGORIES = [
    { id: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ id: cat.slug, label: cat.name }))
  ];
  return (
    <div className="w-full md:w-[220px] lg:w-[240px] flex flex-col gap-8 shrink-0">

      {/* Search */}
      <div>
        <h3 className="text-[18px] font-semibold text-[#422701] mb-3 tracking-tight">Search</h3>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-[14px] text-[#422701] placeholder-[#C6C0B9] border border-[#C6C0B9]/40 focus:outline-none focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588] transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#705E46]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      <div className="h-px w-full bg-[#705E46] opacity-20"></div>

      {/* Categories */}
      <div>
        <h3 className="text-[22px] font-semibold text-[#422701] mb-5 tracking-tight">Categories</h3>
        <ul className="flex flex-col gap-4">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <li
                key={cat.id}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => onCategoryChange(cat.id)}
              >
                <div className="w-4 h-4 rounded-full flex items-center justify-center bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                  {isActive && <div className="w-2 h-2 bg-[#705E46] rounded-full"></div>}
                </div>
                <span className={`text-[15px] transition-colors ${isActive ? 'text-[#422701] font-medium' : 'text-[#705E46] group-hover:text-[#422701]'}`}>
                  {cat.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="h-px w-full bg-[#705E46] opacity-20"></div>

      {/* Dietary (decorative) */}
      <div>
        <h3 className="text-[22px] font-semibold text-[#422701] mb-5 tracking-tight">Dietary</h3>
        <div className="flex flex-wrap gap-2.5">
          {['Vegan', 'Organic', 'Gluten-Free', 'Keto'].map((label) => (
            <button
              key={label}
              className="px-4 py-1.5 rounded-full text-xs border bg-transparent border-[#705E46]/30 text-[#705E46] hover:border-[#705E46] hover:text-[#422701] transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FilterSidebar;
