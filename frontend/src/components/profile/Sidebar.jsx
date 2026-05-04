import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-full md:w-[260px] h-full bg-[#EBEAE5] flex flex-col shrink-0 border-r border-[#C6C0B9]/40">
      <div className="p-10 flex flex-col items-center border-b border-[#C6C0B9]/40">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-[#C6C0B9]/20">
          <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e6e6e6" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-[17px] font-bold text-[#422701] mb-1">FreshAI Member</h2>
        <p className="text-[13px] text-[#705E46] font-light">Organic Enthusiast</p>
      </div>

      <div className="flex flex-col py-6">
        <a href="#" className="relative flex items-center gap-4 px-10 py-4 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#422701]"></div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#422701]"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[14px] font-bold text-[#422701] tracking-wide">Profile Info</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-10 py-4 hover:bg-white/40 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#705E46]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <span className="text-[14px] font-medium text-[#705E46] tracking-wide">My Orders</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-10 py-4 hover:bg-white/40 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#705E46]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span className="text-[14px] font-medium text-[#705E46] tracking-wide">Addresses</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-10 py-4 hover:bg-white/40 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#705E46]"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span className="text-[14px] font-medium text-[#705E46] tracking-wide">Settings</span>
        </a>
      </div>

      <div className="mt-auto py-10 px-10">
        <a href="#" className="flex items-center gap-4 hover:opacity-70 transition-opacity">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#422701]"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span className="text-[14px] font-bold text-[#422701] tracking-wide">Logout</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
