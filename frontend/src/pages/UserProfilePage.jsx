import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMapPin, FiPackage, FiEdit2, FiPlus,
  FiTrash2, FiEdit, FiShield, FiCalendar
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useProfile from '../hooks/useProfile';
import EditProfileModal from '../components/profile/EditProfileModal';
import AddressModal from '../components/profile/AddressModal';
import OrderHistoryCard from '../components/profile/OrderHistoryCard';

const TABS = [
  { id: 'info',      label: 'My Info',   icon: FiUser },
  { id: 'addresses', label: 'Addresses', icon: FiMapPin },
  { id: 'orders',    label: 'Orders',    icon: FiPackage },
];

export default function UserProfilePage() {
  const { user } = useAuth();
  const hook = useProfile();
  const { profile, loading, saving, deleteAddr } = hook;

  const [activeTab, setActiveTab]           = useState('info');
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showAddrModal, setShowAddrModal]   = useState(false);
  const [editingAddr, setEditingAddr]       = useState(null);

  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : user?.firstName?.[0]?.toUpperCase() ?? 'U';

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-skeleton">
          <div className="skel skel--avatar" />
          <div className="skel skel--line" />
          <div className="skel skel--line skel--short" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <p className="profile-hero__email">{profile?.email}</p>
            <span className="profile-hero__role">{profile?.role}</span>
          </div>
          <button className="btn btn--outline btn--sm profile-edit-btn"
            onClick={() => setShowEditModal(true)}>
            <FiEdit2 size={14} /> Edit Profile
          </button>
        </div>

        <div className="profile-meta-strip">
          <div className="profile-meta-item">
            <FiCalendar size={13} />
            <span>Member since {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
              : '—'}</span>
          </div>
          <div className="profile-meta-item">
            <FiPackage size={13} />
            <span>{profile?.recentOrders?.length ?? 0} recent order{profile?.recentOrders?.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="profile-meta-item">
            <FiShield size={13} />
            <span>OTP-secured account</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`profile-tab ${activeTab === t.id ? 'profile-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="profile-content">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div key="info" className="profile-tab-panel"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div className="info-grid">
                <InfoField label="First Name"   value={profile?.firstName} />
                <InfoField label="Last Name"    value={profile?.lastName} />
                <InfoField label="Email"        value={profile?.email} />
                <InfoField label="Phone"        value={profile?.phone || '—'} />
                <InfoField label="Role"         value={profile?.role} />
                <InfoField label="Joined"       value={profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric'})
                  : '—'} />
              </div>
              <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => setShowEditModal(true)}>
                <FiEdit2 size={14} /> Edit Details
              </button>
            </motion.div>
          )}

          {activeTab === 'addresses' && (
            <motion.div key="addresses" className="profile-tab-panel"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div className="addresses-header">
                <h3>Delivery Addresses</h3>
                <button className="btn btn--primary btn--sm" onClick={() => { setEditingAddr(null); setShowAddrModal(true); }}>
                  <FiPlus size={14} /> Add Address
                </button>
              </div>
              {profile?.addresses?.length === 0 && (
                <div className="empty-state">
                  <FiMapPin size={32} />
                  <p>No addresses saved yet.</p>
                </div>
              )}
              <div className="address-cards">
                {profile?.addresses?.map(addr => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'address-card--default' : ''}`}>
                    <div className="address-card__label-row">
                      <span className="address-card__label">{addr.label}</span>
                      {addr.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <p className="address-card__text">{addr.fullAddress}</p>
                    <p className="address-card__city">{addr.city} – {addr.pincode}</p>
                    <div className="address-card__actions">
                      <button className="icon-btn" title="Edit" onClick={() => { setEditingAddr(addr); setShowAddrModal(true); }}>
                        <FiEdit size={14} />
                      </button>
                      <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => deleteAddr(addr.id)} disabled={saving}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" className="profile-tab-panel"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h3 style={{ marginBottom: 16 }}>Recent Orders</h3>
              {profile?.recentOrders?.length === 0 && (
                <div className="empty-state">
                  <FiPackage size={32} />
                  <p>No orders yet. Start shopping!</p>
                </div>
              )}
              <div className="order-history">
                {profile?.recentOrders?.map(o => (
                  <OrderHistoryCard key={o.id} order={o} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          hook={hook}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showAddrModal && (
        <AddressModal
          existing={editingAddr}
          saving={saving}
          onSave={async (data) => {
            const ok = editingAddr
              ? await hook.updateAddr(editingAddr.id, data)
              : await hook.addAddr(data);
            if (ok) setShowAddrModal(false);
          }}
          onClose={() => setShowAddrModal(false)}
        />
      )}
    </motion.div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="info-field">
      <span className="info-field__label">{label}</span>
      <span className="info-field__value">{value}</span>
    </div>
  );
}
