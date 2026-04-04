import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMapPin } from 'react-icons/fi';

const LABELS = ['Home', 'Work', 'Other'];

const empty = { label: 'Home', fullAddress: '', city: '', pincode: '', isDefault: false };

export default function AddressModal({ existing, onSave, onClose, saving }) {
  const [form, setForm]   = useState(existing || empty);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullAddress.trim()) e.fullAddress = 'Address is required.';
    if (!form.city.trim())        e.city        = 'City is required.';
    if (!form.pincode.trim())     e.pincode     = 'Pincode is required.';
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter a valid 6-digit pincode.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-box address-modal"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}><FiX /></button>
          <h3 className="modal-title"><FiMapPin size={18} /> {existing ? 'Edit Address' : 'Add New Address'}</h3>

          {/* Label */}
          <div className="form-group">
            <label>Label</label>
            <div className="label-pills">
              {LABELS.map(l => (
                <button
                  key={l}
                  type="button"
                  className={`label-pill ${form.label === l ? 'label-pill--active' : ''}`}
                  onClick={() => setForm(p => ({ ...p, label: l }))}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Full Address */}
          <div className="form-group">
            <label>Full Address</label>
            <textarea
              className={`input textarea ${errors.fullAddress ? 'input--error' : ''}`}
              rows={3}
              placeholder="Flat / House No., Street, Area"
              value={form.fullAddress}
              onChange={e => setForm(p => ({ ...p, fullAddress: e.target.value }))}
            />
            {errors.fullAddress && <span className="field-error">{errors.fullAddress}</span>}
          </div>

          {/* City + Pincode */}
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input className={`input ${errors.city ? 'input--error' : ''}`}
                placeholder="City" value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              {errors.city && <span className="field-error">{errors.city}</span>}
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input className={`input ${errors.pincode ? 'input--error' : ''}`}
                placeholder="6-digit pincode" value={form.pincode}
                maxLength={6}
                onChange={e => setForm(p => ({ ...p, pincode: e.target.value.replace(/\D/g,'') }))} />
              {errors.pincode && <span className="field-error">{errors.pincode}</span>}
            </div>
          </div>

          {/* Default toggle */}
          <label className="toggle-row">
            <input type="checkbox" checked={form.isDefault}
              onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
            <span>Set as default delivery address</span>
          </label>

          <button className="btn btn--primary btn--full" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : existing ? 'Update Address' : 'Save Address'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
