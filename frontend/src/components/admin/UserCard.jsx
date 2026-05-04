import React from 'react';

export default function UserCard({ user, onToggleStatus, onClick }) {
  const getRoleStyle = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-[#9CA8B8] text-white';
      case 'CURATOR': return 'bg-[#E6D1B3] text-[#705E46]';
      case 'ANALYST': return 'bg-[#E6E1D8] text-[#705E46]';
      default: return 'bg-[#E6E1D8] text-[#705E46]';
    }
  };

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <div 
      onClick={() => onClick && onClick(user)}
      className="bg-[#FDFBF7] border border-[#C6C0B9]/40 rounded-2xl p-5 mb-4 flex items-center justify-between transition-all hover:shadow-[0_4px_20px_-4px_rgba(198,192,185,0.3)] hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-5 w-1/3 pl-2">
        {user.profileImage ? (
          <img src={user.profileImage} alt={user.firstName} className="w-[50px] h-[50px] rounded-full object-cover shadow-sm" />
        ) : (
          <div className="w-[50px] h-[50px] rounded-full bg-[#EAE5DB] flex items-center justify-center text-[#705E46] font-bold text-[1.1rem] shadow-sm">
            {initials}
          </div>
        )}
        <div className="flex flex-col justify-center">
          <h4 className="text-[#422701] font-bold text-[1rem] tracking-wide mb-0.5">{user.firstName} {user.lastName}</h4>
          <p className="text-[#705E46] text-[0.85rem]">{user.email}</p>
        </div>
      </div>

      {/* Center: Role */}
      <div className="w-1/3 flex justify-center">
        <span className={`px-5 py-1.5 rounded-full text-[0.75rem] font-bold tracking-wider ${getRoleStyle(user.role)}`}>
          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'User'}
        </span>
      </div>

      {/* Right: Last Active & Toggle */}
      <div className="w-1/3 flex items-center justify-end gap-12 pr-4">
        <span className="text-[#705E46] text-[0.85rem]">Last active: {user.lastActive || 'Just now'}</span>
        
        {/* Toggle Switch */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleStatus(user); }}
          className={`relative inline-flex h-[26px] w-[50px] items-center rounded-full transition-colors focus:outline-none ${user.isActive !== false ? 'bg-[#422701]' : 'bg-[#EAE5DB]'}`}
        >
          <span className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform ${user.isActive !== false ? 'translate-x-[26px]' : 'translate-x-[3px]'}`} />
        </button>
      </div>
    </div>
  );
}
