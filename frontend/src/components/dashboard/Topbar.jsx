import React from 'react';

const Topbar = () => {
  return (
    <header
      className="flex items-center justify-end gap-5 px-8 py-4 border-b"
      style={{ backgroundColor: '#F5F1EC', borderColor: 'rgba(0,0,0,0.06)' }}
    >
      {/* Cart */}
      <button
        className="p-2 rounded-full hover:bg-black/5 transition-colors"
        style={{ color: '#422701' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </button>

      {/* Notification */}
      <button
        className="p-2 rounded-full hover:bg-black/5 transition-colors relative"
        style={{ color: '#422701' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>

      {/* Avatar */}
      <button className="rounded-full overflow-hidden w-9 h-9 shrink-0 ring-2 ring-[#D6B588] transition-all hover:ring-[#705E46]">
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </button>
    </header>
  );
};

export default Topbar;
