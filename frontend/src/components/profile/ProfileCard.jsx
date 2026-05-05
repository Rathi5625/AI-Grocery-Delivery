import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import EditProfileModal from './EditProfileModal';
import { FiCamera, FiEdit2, FiMail, FiPhone } from 'react-icons/fi';

const ProfileCard = ({ hook }) => {
  const { user } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [localImage, setLocalImage] = useState(null);   // preview before upload
  const fileInputRef = useRef(null);
  const profile = hook?.profile;

  const displayName = profile?.firstName
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : user ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'User';

  const email   = profile?.email   || user?.email   || '—';
  const phone   = profile?.phone   || user?.phone   || 'Not added';
  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarUrl = localImage || profile?.profileImage || user?.profileImage || null;

  // ── Profile image change ──────────────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview instantly
    const previewUrl = URL.createObjectURL(file);
    setLocalImage(previewUrl);
    // Try uploading to backend (gracefully fails if endpoint not ready)
    if (hook?.uploadProfileImage) {
      const ok = await hook.uploadProfileImage(file);
      if (!ok) {
        // Keep preview locally even if upload fails
      }
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <>
      <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex flex-col h-full border border-[#C6C0B9]/20">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-[22px] font-bold text-[#422701] tracking-tight">Profile Info</h3>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#705E46] tracking-widest uppercase hover:text-[#422701] transition-colors focus:outline-none group"
          >
            <FiEdit2 size={12} className="group-hover:scale-110 transition-transform" />
            Edit
          </button>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5 group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#D6B588] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#422701]">{initials}</span>
              )}
            </div>
            {/* Camera overlay */}
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <FiCamera size={22} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#D6B588] rounded-full flex items-center justify-center shadow-md border-2 border-white">
              <FiCamera size={13} className="text-[#422701]" />
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <h2 className="text-[26px] font-bold text-[#422701] mb-1 tracking-tight text-center">{displayName}</h2>
          <p className="text-[12px] text-[#705E46] tracking-widest uppercase mb-4">FreshAI Member</p>
          <div className="flex items-center gap-2">
            <span className="bg-[#EAE5DF] text-[#705E46] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Premium</span>
            <span className="bg-[#EAE5DF] text-[#705E46] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">Member</span>
          </div>
        </div>

        {/* Email & Phone */}
        <div className="mt-auto flex flex-col gap-3.5">
          {/* Email */}
          <div className="bg-[#FAF8F5] rounded-[16px] p-4 flex items-center gap-4 border border-[#EAE5DF]">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#705E46] shrink-0">
              <FiMail size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase mb-0.5">Email</div>
              <div className="text-[13px] font-medium text-[#422701] truncate">{email}</div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-[10px] font-bold text-[#D6B588] tracking-widest uppercase hover:text-[#422701] shrink-0 transition-colors"
            >
              Change
            </button>
          </div>

          {/* Phone */}
          <div className="bg-[#FAF8F5] rounded-[16px] p-4 flex items-center gap-4 border border-[#EAE5DF]">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#705E46] shrink-0">
              <FiPhone size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase mb-0.5">Phone</div>
              <div className={`text-[13px] font-medium truncate ${phone === 'Not added' ? 'text-[#C6C0B9] italic' : 'text-[#422701]'}`}>
                {phone}
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-[10px] font-bold text-[#D6B588] tracking-widest uppercase hover:text-[#422701] shrink-0 transition-colors"
            >
              {phone === 'Not added' ? 'Add' : 'Change'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          hook={hook}
        />
      )}
    </>
  );
};

export default ProfileCard;
