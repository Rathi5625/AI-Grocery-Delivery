import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiPackage, FiMapPin, FiSettings, FiLogOut } from 'react-icons/fi';

const NAV_LINKS = [
  { label: 'Profile Info',  icon: FiUser,     href: '/profile' },
  { label: 'My Orders',     icon: FiPackage,  href: '/orders' },
  { label: 'Addresses',     icon: FiMapPin,   href: '/profile#addresses' },
  { label: 'Settings',      icon: FiSettings, href: '/profile#settings' },
];

const Sidebar = ({ profile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'FreshAI Member';

  const avatarUrl   = profile?.profileImage || user?.profileImage || null;
  const initials    = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const currentPath = window.location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full md:w-[260px] h-full bg-[#EBEAE5] flex flex-col shrink-0 border-r border-[#C6C0B9]/40">

      {/* Avatar + name */}
      <div className="p-10 flex flex-col items-center border-b border-[#C6C0B9]/40">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-[#D6B588] flex items-center justify-center shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-[#422701]">{initials}</span>
          )}
        </div>
        <h2 className="text-[17px] font-bold text-[#422701] mb-1 text-center">{displayName}</h2>
        <p className="text-[13px] text-[#705E46] font-light">Organic Enthusiast</p>
      </div>

      {/* Nav links */}
      <div className="flex flex-col py-6">
        {NAV_LINKS.map(({ label, icon: Icon, href }) => {
          const isActive = currentPath === href || (href !== '/profile' && currentPath.startsWith(href.split('#')[0]));
          return (
            <Link
              key={label}
              to={href}
              className={`relative flex items-center gap-4 px-10 py-4 transition-colors ${
                isActive
                  ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                  : 'hover:bg-white/40'
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#422701]" />}
              <Icon size={18} className={isActive ? 'text-[#422701]' : 'text-[#705E46]'} />
              <span className={`text-[14px] tracking-wide ${isActive ? 'font-bold text-[#422701]' : 'font-medium text-[#705E46]'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="mt-auto py-10 px-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 hover:opacity-70 transition-opacity w-full text-left"
        >
          <FiLogOut size={18} className="text-[#422701]" />
          <span className="text-[14px] font-bold text-[#422701] tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
