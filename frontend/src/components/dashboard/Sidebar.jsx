import React from 'react';

const navItems = [
  {
    id: 'curations',
    label: 'Curations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'weekly-basket',
    label: 'Weekly Basket',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    id: 'recipes',
    label: 'Recipes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
      </svg>
    ),
  },
  {
    id: 'impact',
    label: 'Impact',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
    ),
  },
];

const Sidebar = ({ active = 'curations' }) => {
  return (
    <aside
      style={{ backgroundColor: '#E8E3DC', width: '210px', minHeight: '100vh' }}
      className="flex flex-col justify-between py-8 px-5 shrink-0"
    >
      {/* Logo */}
      <div>
        <div className="mb-10">
          <div style={{ color: '#422701' }} className="text-2xl font-bold tracking-tight leading-none">
            Pantry AI
          </div>
          <div style={{ color: '#705E46' }} className="text-[10px] font-semibold tracking-[0.18em] uppercase mt-1">
            Quiet Luxury Curation
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 w-full"
                style={{
                  backgroundColor: isActive ? 'rgba(66,39,1,0.08)' : 'transparent',
                  color: isActive ? '#422701' : '#705E46',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid #D6B588' : '3px solid transparent',
                }}
              >
                <span style={{ color: isActive ? '#422701' : '#705E46' }}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4">
        <button
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
          style={{ backgroundColor: '#D6B588', color: '#422701' }}
        >
          Refine Palate
        </button>

        <div className="flex flex-col gap-2 mt-1">
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-black/5"
            style={{ color: '#705E46' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            Settings
          </button>
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:bg-black/5"
            style={{ color: '#705E46' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Support
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
