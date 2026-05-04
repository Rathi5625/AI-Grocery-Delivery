import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

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
      return; // could add toast.error
    }
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-6 border border-[#EAE5DF] w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase">Label</label>
        <select 
          className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg px-3 py-2 text-[14px] text-[#422701] focus:outline-none focus:border-[#D6B588]"
          value={form.label} 
          onChange={set('label')}
        >
          {['Home', 'Work', 'Other'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase">Full Address *</label>
        <textarea
          className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg px-3 py-2 text-[14px] text-[#422701] focus:outline-none focus:border-[#D6B588] resize-none"
          rows={2}
          value={form.fullAddress}
          onChange={set('fullAddress')}
          placeholder="Street, building, flat no."
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase">City *</label>
          <input 
            className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg px-3 py-2 text-[14px] text-[#422701] focus:outline-none focus:border-[#D6B588]"
            value={form.city} 
            onChange={set('city')} 
            placeholder="City" 
            required 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[#705E46] tracking-[0.15em] uppercase">Pincode *</label>
          <input 
            className="bg-[#FAF8F5] border border-[#EAE5DF] rounded-lg px-3 py-2 text-[14px] text-[#422701] focus:outline-none focus:border-[#D6B588]"
            value={form.pincode} 
            onChange={set('pincode')} 
            placeholder="Pincode" 
            required 
          />
        </div>
      </div>
      <label className="flex items-center gap-2 mt-2 text-[13px] text-[#422701] font-medium cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 accent-[#D6B588]"
          checked={form.isDefault}
          onChange={(e) => setForm(p => ({ ...p, isDefault: e.target.checked }))}
        />
        Set as default address
      </label>
      <div className="flex items-center gap-2 mt-2">
        <button 
          type="submit" 
          disabled={saving}
          className="bg-[#D6B588] text-[#422701] text-[13px] font-bold px-5 py-2.5 rounded-lg hover:bg-[#c5a374] transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : (existing ? 'Update Address' : 'Add Address')}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          className="bg-[#EAE5DF] text-[#422701] text-[13px] font-bold px-5 py-2.5 rounded-lg hover:bg-[#d8cfc5] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const AddressCard = ({ hook }) => {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);

  const addresses = hook?.profile?.addresses || [];
  const saving = hook?.saving;

  const displayAddresses = addresses;

  return (
    <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#C6C0B9]/20 w-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[22px] font-bold text-[#422701] tracking-tight">Saved Addresses</h3>
        {!showForm && (
          <button 
            onClick={() => { setEditingAddr(null); setShowForm(true); }}
            className="bg-[#D6B588] text-[#422701] font-semibold text-[13px] px-4 py-2.5 rounded-lg flex items-center gap-1.5 hover:bg-[#c5a374] transition-colors shadow-sm focus:outline-none"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add New
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <AddressForm 
            existing={editingAddr} 
            saving={saving}
            onSave={async (data) => {
              if (hook) {
                const ok = editingAddr 
                  ? await hook.updateAddr(editingAddr.id, data) 
                  : await hook.addAddr(data);
                if (ok) { setShowForm(false); setEditingAddr(null); }
              } else {
                setShowForm(false); setEditingAddr(null);
              }
            }}
            onCancel={() => { setShowForm(false); setEditingAddr(null); }}
          />
        </div>
      )}

      {!showForm && displayAddresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DF] text-center">
          <span className="text-4xl mb-4">📍</span>
          <h4 className="text-[#422701] font-bold text-lg mb-2">No saved addresses</h4>
          <p className="text-[#705E46] text-sm mb-6 max-w-sm">Add a delivery address to ensure a seamless checkout experience.</p>
          <button onClick={() => { setEditingAddr(null); setShowForm(true); }} className="bg-[#D6B588] text-[#422701] font-bold px-6 py-2.5 rounded-xl hover:bg-[#c5a374] transition-colors shadow-sm focus:outline-none">
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayAddresses.map((addr, idx) => (
          <div key={addr.id || idx}
               className={`rounded-[16px] p-6 border flex flex-col h-full ${addr.isDefault ? 'bg-[#FAF8F5] border-transparent' : 'bg-white border-[#EAE5DF]'}`}>
            <div className="flex items-center gap-3 mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#422701]">
                {addr.label?.toLowerCase() === 'home' 
                  ? <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  : <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                }
              </svg>
              <span className="text-[14px] font-bold text-[#422701] tracking-widest uppercase">
                {addr.label || `Address ${idx + 1}`}
              </span>
              {addr.isDefault && (
                <span className="bg-[#EAE5DF] text-[#705E46] text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase ml-1">Default</span>
              )}
            </div>
            <div className="text-[14px] text-[#422701] leading-[1.7] mb-5 whitespace-pre-wrap">
              {addr.fullAddress || addr.line1 || addr.addressLine1}
              {addr.line2 && `\n${addr.line2}`}
              {`\n${addr.city}, ${addr.state || ''} ${addr.pincode || addr.zip || addr.zipCode}`}
              {(addr.country && addr.country !== 'United States') ? `\n${addr.country}` : ''}
            </div>
            {addr.instructions && (
              <p className="text-[13px] text-[#705E46] font-light mt-auto pt-2">
                Delivery instructions: {addr.instructions}
              </p>
            )}
            {hook && addr.id && (
              <div className="flex gap-4 mt-auto pt-4 border-t border-[#EAE5DF]/50">
                <button 
                  onClick={() => { setEditingAddr(addr); setShowForm(true); }}
                  className="text-[11px] font-bold text-[#705E46] tracking-widest uppercase hover:text-[#422701] transition-colors focus:outline-none"
                >
                  Edit
                </button>
                <button 
                  onClick={() => hook.deleteAddr(addr.id)}
                  disabled={saving}
                  className="text-[11px] font-bold text-red-500/80 tracking-widest uppercase hover:text-red-700 transition-colors focus:outline-none disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default AddressCard;
