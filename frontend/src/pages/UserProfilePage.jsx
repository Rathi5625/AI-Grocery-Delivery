import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMapPin, FiPackage, FiEdit2, FiPlus,
  FiTrash2, FiEdit, FiShield, FiCalendar, FiCheck,
  FiX, FiSave, FiPhone, FiMail,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import useProfile from '../hooks/useProfile';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'info',      label: 'My Info',    icon: FiUser },
  { id: 'addresses', label: 'Addresses',  icon: FiMapPin },
  { id: 'orders',    label: 'Orders',     icon: FiPackage },
];

/* ── Inline edit form for first/last name ── */
function EditNameForm({ profile, hook, onDone }) {
  const [firstName, setFirst] = useState(profile?.firstName || '');
  const [lastName,  setLast]  = useState(profile?.lastName  || '');
  const { saving, saveBasicInfo } = hook;

  const handleSave = async () => {
    if (!firstName.trim()) { toast.error('First name is required'); return; }
    const ok = await saveBasicInfo({ firstName: firstName.trim(), lastName: lastName.trim() });
    if (ok) onDone();
  };

  return (
    <motion.div
      className="inline-edit-form"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiEdit2 size={15} /> Edit Name
      </h4>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            className="form-input"
            value={firstName}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="First name"
            id="edit-first-name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            className="form-input"
            value={lastName}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Last name"
            id="edit-last-name"
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          className="btn btn--primary"
          onClick={handleSave}
          disabled={saving}
          id="save-profile-btn"
        >
          {saving ? <span className="spinner" /> : <><FiSave size={14} /> Save Changes</>}
        </button>
        <button className="btn btn--secondary" onClick={onDone}>
          <FiX size={14} /> Cancel
        </button>
      </div>
      {saving && (
        <motion.p
          className="save-success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: 'var(--primary)', fontSize: 13, marginTop: 8 }}
        >
          Saving…
        </motion.p>
      )}
    </motion.div>
  );
}

/* ── Address Form ── */
function AddressForm({ existing, saving, onSave, onCancel }) {
  const [form, setForm] = useState({
    label:       existing?.label       || 'Home',
    fullAddress: existing?.fullAddress || '',
    city:        existing?.city        || '',
    pincode:     existing?.pincode     || '',
    isDefault:   existing?.isDefault   || false,
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullAddress.trim() || !form.city.trim() || !form.pincode.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="address-form">
      <div className="form-group">
        <label className="form-label">Label</label>
        <select className="form-input" value={form.label} onChange={set('label')} id="addr-label">
          {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Full Address *</label>
        <textarea
          className="form-input"
          rows={2}
          value={form.fullAddress}
          onChange={set('fullAddress')}
          placeholder="Street, building, flat no."
          id="addr-full"
          required
        />
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">City *</label>
          <input className="form-input" value={form.city} onChange={set('city')} placeholder="City" id="addr-city" required />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode *</label>
          <input className="form-input" value={form.pincode} onChange={set('pincode')} placeholder="6-digit pincode" id="addr-pincode" required />
        </div>
      </div>
      <label className="form-checkbox-label" style={{ marginTop: 4 }}>
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => setForm(p => ({ ...p, isDefault: e.target.checked }))}
          id="addr-default"
        />
        Set as default address
      </label>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn--primary" type="submit" disabled={saving} id="save-addr-btn">
          {saving ? <span className="spinner" /> : <><FiSave size={14} /> {existing ? 'Update' : 'Add'} Address</>}
        </button>
        <button className="btn btn--secondary" type="button" onClick={onCancel}>
          <FiX size={14} /> Cancel
        </button>
      </div>
    </form>
  );
}

/* ── Main Page ── */
export default function UserProfilePage() {
  const { user } = useAuth();
  const hook = useProfile();
  const { profile, loading, saving, deleteAddr } = hook;

  const [activeTab, setActiveTab]       = useState('info');
  const [editingName, setEditingName]   = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [editingAddr, setEditingAddr]   = useState(null);

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
      {/* ── Hero banner ── */}
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">
              {profile?.firstName} {profile?.lastName}
            </h1>
            <p className="profile-hero__email">
              <FiMail size={13} style={{ marginRight: 5 }} />{profile?.email}
            </p>
            {profile?.phone && (
              <p className="profile-hero__email" style={{ marginTop: 2 }}>
                <FiPhone size={13} style={{ marginRight: 5 }} />{profile?.phone}
              </p>
            )}
            <span className="profile-hero__role">{profile?.role}</span>
          </div>
          <button
            className="btn btn--outline btn--sm profile-edit-btn"
            onClick={() => { setActiveTab('info'); setEditingName(true); }}
            id="edit-profile-btn"
          >
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
            <span>{profile?.recentOrders?.length ?? 0} recent orders</span>
          </div>
          <div className="profile-meta-item">
            <FiShield size={13} />
            <span>OTP-secured account</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`profile-tab ${activeTab === t.id ? 'profile-tab--active' : ''}`}
            onClick={() => { setActiveTab(t.id); setEditingName(false); }}
            id={`tab-${t.id}`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="profile-content">
        <AnimatePresence mode="wait">

          {/* ── Info Tab ── */}
          {activeTab === 'info' && (
            <motion.div key="info" className="profile-tab-panel"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>

              <AnimatePresence mode="wait">
                {editingName ? (
                  <EditNameForm key="form" profile={profile} hook={hook} onDone={() => setEditingName(false)} />
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="info-grid">
                      <InfoField label="First Name"  value={profile?.firstName} />
                      <InfoField label="Last Name"   value={profile?.lastName} />
                      <InfoField label="Email"       value={profile?.email} />
                      <InfoField label="Phone"       value={profile?.phone || '—'} />
                      <InfoField label="Role"        value={profile?.role} />
                      <InfoField label="Joined"      value={profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—'} />
                    </div>
                    <button
                      className="btn btn--primary"
                      style={{ marginTop: 20 }}
                      onClick={() => setEditingName(true)}
                      id="edit-name-btn"
                    >
                      <FiEdit2 size={14} /> Edit Name
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Addresses Tab ── */}
          {activeTab === 'addresses' && (
            <motion.div key="addresses" className="profile-tab-panel"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <div className="addresses-header">
                <h3>Delivery Addresses</h3>
                {!showAddrForm && (
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => { setEditingAddr(null); setShowAddrForm(true); }}
                    id="add-address-btn"
                  >
                    <FiPlus size={14} /> Add Address
                  </button>
                )}
              </div>

              <AnimatePresence>
                {showAddrForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden', marginBottom: 20 }}
                  >
                    <div className="address-form-card">
                      <h4 style={{ marginBottom: 14 }}>
                        {editingAddr ? 'Edit Address' : 'New Address'}
                      </h4>
                      <AddressForm
                        existing={editingAddr}
                        saving={saving}
                        onSave={async (data) => {
                          const ok = editingAddr
                            ? await hook.updateAddr(editingAddr.id, data)
                            : await hook.addAddr(data);
                          if (ok) { setShowAddrForm(false); setEditingAddr(null); }
                        }}
                        onCancel={() => { setShowAddrForm(false); setEditingAddr(null); }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {(!profile?.addresses || profile.addresses.length === 0) && !showAddrForm && (
                <div className="empty-state">
                  <FiMapPin size={32} />
                  <p>No addresses saved yet.</p>
                  <button className="btn btn--primary btn--sm" onClick={() => setShowAddrForm(true)}>
                    <FiPlus size={14} /> Add Your First Address
                  </button>
                </div>
              )}

              <div className="address-cards">
                {profile?.addresses?.map(addr => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? 'address-card--default' : ''}`}>
                    <div className="address-card__label-row">
                      <span className="address-card__label">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="default-badge"><FiCheck size={11} /> Default</span>
                      )}
                    </div>
                    <p className="address-card__text">{addr.fullAddress}</p>
                    <p className="address-card__city">{addr.city} – {addr.pincode}</p>
                    <div className="address-card__actions">
                      <button
                        className="icon-btn"
                        title="Edit"
                        onClick={() => { setEditingAddr(addr); setShowAddrForm(true); }}
                        id={`edit-addr-${addr.id}`}
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        className="icon-btn icon-btn--danger"
                        title="Delete"
                        onClick={() => deleteAddr(addr.id)}
                        disabled={saving}
                        id={`del-addr-${addr.id}`}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Orders Tab ── */}
          {activeTab === 'orders' && (
            <motion.div key="orders" className="profile-tab-panel"
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
              <h3 style={{ marginBottom: 16 }}>Recent Orders</h3>
              {(!profile?.recentOrders || profile.recentOrders.length === 0) ? (
                <div className="empty-state">
                  <FiPackage size={32} />
                  <p>No orders yet. Start shopping!</p>
                </div>
              ) : (
                <div className="order-history">
                  {profile.recentOrders.map(o => (
                    <div key={o.id} className="order-history-card">
                      <div className="order-history-card__header">
                        <span className="order-history-card__id">Order #{o.id}</span>
                        <span className={`order-history-card__status order-history-card__status--${(o.status || 'pending').toLowerCase()}`}>
                          {o.status}
                        </span>
                      </div>
                      <div className="order-history-card__meta">
                        <span>₹{o.totalAmount}</span>
                        <span>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="info-field">
      <span className="info-field__label">{label}</span>
      <span className="info-field__value">{value ?? '—'}</span>
    </div>
  );
}
