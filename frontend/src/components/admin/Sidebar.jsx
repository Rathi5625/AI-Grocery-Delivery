import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiShoppingBag, FiFileText, FiUsers, FiBox, FiSettings, FiPlus } from 'react-icons/fi';
import { PiPlantFill } from 'react-icons/pi';

const menuItems = [
  { id: 'dashboard', label: 'DASHBOARD', icon: FiGrid,      path: '/admin' },
  { id: 'products',  label: 'PRODUCTS',  icon: FiShoppingBag, path: '/admin/products' },
  { id: 'orders',    label: 'ORDERS',    icon: FiFileText,  path: '/admin/orders' },
  { id: 'users',     label: 'USERS',     icon: FiUsers,     path: '/admin/users' },
  { id: 'inventory', label: 'INVENTORY', icon: FiBox,       path: '/admin/inventory' },
  { id: 'settings',  label: 'SETTINGS',  icon: FiSettings,  path: '/admin/settings' },
];

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    // Exact match for dashboard, prefix match for others
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[260px] bg-[#E8E4DA] h-screen flex flex-col fixed left-0 top-0 border-r border-[#C6C0B9]/30 z-20">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-8 pt-10 pb-12">
        <div className="w-10 h-10 rounded-full bg-[#D6B588] flex items-center justify-center shrink-0">
          <PiPlantFill size={20} className="text-[#422701]" />
        </div>
        <div>
          <h1 className="text-[1.1rem] font-extrabold text-[#422701] leading-tight tracking-wide">AURA ADMIN</h1>
          <p className="text-[#705E46] text-[0.7rem] tracking-widest uppercase mt-0.5">ai curation suite</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-4 pl-8 py-4 transition-all duration-200 text-[0.85rem] tracking-widest relative ${
                active
                  ? 'bg-[#F2ECE4] text-[#422701] font-bold shadow-sm'
                  : 'text-[#705E46] hover:bg-[#C6C0B9]/20 font-medium'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#D8761E]" />
              )}
              <Icon size={18} className={active ? 'text-[#422701]' : 'text-[#705E46]'} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Action */}
      <div className="p-8 mt-auto">
        <button className="w-full py-3.5 bg-[#D6B588] text-[#422701] rounded-xl font-bold text-[0.85rem] tracking-wide transition-colors hover:bg-[#cba878] shadow-sm flex items-center justify-center gap-2">
          <FiPlus size={16} /> New Entry
        </button>
      </div>
    </aside>
  );
}
