import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function EditNameForm({ profile, hook, onDone }) {
  const [firstName, setFirst] = useState(profile?.firstName || '');
  const [lastName,  setLast]  = useState(profile?.lastName  || '');
  const { saving, saveBasicInfo } = hook;

  const handleSave = async () => {
    if (!firstName.trim()) return;
    const ok = await saveBasicInfo({ firstName: firstName.trim(), lastName: lastName.trim() });
    if (ok) onDone();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase">First Name</label>
        <input
          className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg px-3 py-2 text-[14px] text-[#422701] focus:outline-none focus:border-[#D6B588]"
          value={firstName}
          onChange={(e) => setFirst(e.target.value)}
          placeholder="First name"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase">Last Name</label>
        <input
          className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg px-3 py-2 text-[14px] text-[#422701] focus:outline-none focus:border-[#D6B588]"
          value={lastName}
          onChange={(e) => setLast(e.target.value)}
          placeholder="Last name"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          className="bg-[#422701] text-white text-[12px] font-bold px-4 py-2 rounded-lg disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          className="bg-[#EAE5DF] text-[#422701] text-[12px] font-bold px-4 py-2 rounded-lg"
          onClick={onDone}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const ProfileCard = ({ hook }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const profile = hook?.profile;

  const displayName = profile?.firstName
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : user ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Eleanor Vance';

  const email = profile?.email || user?.email || 'user@freshai.co';
  const phone = profile?.phone || user?.phone || '+1 (555) 000-0000';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full border border-[#C6C0B9]/20">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-[22px] font-bold text-[#422701] tracking-tight">Profile Info</h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#705E46] tracking-widest uppercase hover:text-[#422701] transition-colors focus:outline-none"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Edit
          </button>
        )}
      </div>

      <div className="flex flex-col items-center mb-12">
        <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-white shadow-md bg-[#D6B588] flex items-center justify-center">
          <span className="text-3xl font-bold text-[#422701]">{initials}</span>
        </div>
        {!isEditing ? (
          <>
            <h2 className="text-[26px] font-bold text-[#422701] mb-4 tracking-tight">{displayName}</h2>
            <div className="flex items-center gap-5 text-[13px] text-[#422701] font-medium">
              <span>Premium</span>
              <span>Member</span>
            </div>
          </>
        ) : (
          <EditNameForm profile={profile} hook={hook} onDone={() => setIsEditing(false)} />
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3.5">
        {/* Email */}
        <div className="bg-[#FAF8F5] rounded-[16px] p-4 flex items-center gap-5 border border-[#EAE5DF]">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#705E46] shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <div className="truncate w-full">
            <div className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase mb-1">Email</div>
            <div className="text-[14px] font-medium text-[#422701] truncate">{email}</div>
          </div>
        </div>

        {/* Phone */}
        <div className="bg-[#FAF8F5] rounded-[16px] p-4 flex items-center gap-5 border border-[#EAE5DF]">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#705E46] shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          </div>
          <div className="truncate w-full">
            <div className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase mb-1">Phone</div>
            <div className="text-[14px] font-medium text-[#422701] truncate">{phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
