import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEdit2, FiUser, FiMail, FiPhone, FiLock, FiChevronRight } from 'react-icons/fi';
import OtpModal from './OtpModal';

const FIELDS = [
  { key: 'name',     label: 'Full Name',     icon: FiUser,  sensitive: false },
  { key: 'email',    label: 'Email Address', icon: FiMail,  sensitive: true,  purpose: 'EMAIL_CHANGE' },
  { key: 'phone',    label: 'Phone Number',  icon: FiPhone, sensitive: true,  purpose: 'PHONE_CHANGE' },
  { key: 'password', label: 'Password',      icon: FiLock,  sensitive: true,  purpose: 'PASSWORD_CHANGE' },
];

export default function EditProfileModal({ profile, onClose, hook }) {
  const { saving, otpSent, otpPurpose, otpLoading, otpVerified,
          saveBasicInfo, requestOtp, confirmOtp, saveSensitiveField, resetOtp } = hook;

  const [activeField, setActiveField] = useState(null);
  const [form, setForm] = useState({
    firstName:   profile?.firstName || '',
    lastName:    profile?.lastName  || '',
    email:       '',
    phone:       '',
    newPassword: '',
    confirmPwd:  '',
  });
  const [errors, setErrors] = useState({});

  const handleFieldSelect = (field) => {
    setActiveField(field);
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (activeField?.key === 'name') {
      if (!form.firstName.trim()) e.firstName = 'First name is required.';
      if (!form.lastName.trim())  e.lastName  = 'Last name is required.';
    }
    if (activeField?.key === 'email') {
      if (!form.email.trim())              e.email = 'Email is required.';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email.';
    }
    if (activeField?.key === 'phone') {
      if (!form.phone.trim())              e.phone = 'Phone is required.';
      else if (!/^\d{10,15}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Invalid phone number.';
    }
    if (activeField?.key === 'password') {
      if (!form.newPassword)               e.newPassword = 'Password is required.';
      else if (form.newPassword.length < 8) e.newPassword = 'Min 8 characters.';
      if (form.newPassword !== form.confirmPwd) e.confirmPwd = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (!activeField.sensitive) {
      // Non-sensitive: just save
      const ok = await saveBasicInfo({
        firstName: form.firstName,
        lastName:  form.lastName,
      });
      if (ok) onClose();
    } else if (!otpVerified) {
      // Send OTP first
      const target = activeField.key === 'email' ? form.email
                   : activeField.key === 'phone' ? form.phone
                   : null;
      await requestOtp(activeField.purpose, target);
    } else {
      // OTP verified → submit
      const payload = activeField.key === 'email'    ? { email: form.email }
                    : activeField.key === 'phone'    ? { phone: form.phone }
                    : { newPassword: form.newPassword };
      const ok = await saveSensitiveField(payload);
      if (ok) onClose();
    }
  };

  const handleOtpVerify = async (code) => {
    await confirmOtp(code);
  };

  const handleOtpResend = async () => {
    const target = activeField?.key === 'email' ? form.email
                 : activeField?.key === 'phone' ? form.phone
                 : null;
    await requestOtp(activeField?.purpose, target);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-box edit-profile-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose}><FiX /></button>
            <h3 className="modal-title"><FiEdit2 size={18} /> Edit Profile</h3>

            {!activeField ? (
              // ── Field picker ──────────────────────────────────────────
              <div className="edit-profile-fields">
                {FIELDS.map(f => (
                  <button key={f.key} className="edit-field-row" onClick={() => handleFieldSelect(f)}>
                    <span className="edit-field-row__icon"><f.icon size={16} /></span>
                    <span className="edit-field-row__label">{f.label}</span>
                    {f.sensitive && <span className="edit-field-row__badge">OTP required</span>}
                    <FiChevronRight size={16} className="edit-field-row__arrow" />
                  </button>
                ))}
              </div>
            ) : (
              // ── Field edit form ───────────────────────────────────────
              <div className="edit-profile-form">
                <button className="back-link" onClick={() => { setActiveField(null); resetOtp(); }}>
                  ← Back
                </button>

                <h4 className="edit-form-heading">
                  <activeField.icon size={16} /> {activeField.label}
                </h4>

                {activeField.key === 'name' && (
                  <>
                    <div className="form-group">
                      <label>First Name</label>
                      <input className={`input ${errors.firstName ? 'input--error' : ''}`}
                        value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
                      {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input className={`input ${errors.lastName ? 'input--error' : ''}`}
                        value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                      {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                    </div>
                  </>
                )}

                {activeField.key === 'email' && (
                  <div className="form-group">
                    <label>New Email Address</label>
                    <input type="email" className={`input ${errors.email ? 'input--error' : ''}`}
                      value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      disabled={otpVerified} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                )}

                {activeField.key === 'phone' && (
                  <div className="form-group">
                    <label>New Phone Number</label>
                    <input type="tel" className={`input ${errors.phone ? 'input--error' : ''}`}
                      value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      disabled={otpVerified} />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                )}

                {activeField.key === 'password' && (
                  <>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" className={`input ${errors.newPassword ? 'input--error' : ''}`}
                        value={form.newPassword} onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                        disabled={otpVerified} />
                      {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input type="password" className={`input ${errors.confirmPwd ? 'input--error' : ''}`}
                        value={form.confirmPwd} onChange={e => setForm(p => ({ ...p, confirmPwd: e.target.value }))}
                        disabled={otpVerified} />
                      {errors.confirmPwd && <span className="field-error">{errors.confirmPwd}</span>}
                    </div>
                  </>
                )}

                {activeField.sensitive && otpVerified && (
                  <div className="otp-verified-badge">✓ OTP Verified — ready to save</div>
                )}

                <button
                  className="btn btn--primary btn--full"
                  onClick={handleSave}
                  disabled={saving || otpLoading}
                >
                  {saving || otpLoading ? <span className="spinner" /> :
                   !activeField.sensitive || otpVerified ? 'Save Changes' : 'Send OTP & Continue'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* OTP Modal */}
      {otpSent && !otpVerified && (
        <OtpModal
          purpose={otpPurpose}
          target={activeField?.key === 'email' ? form.email : activeField?.key === 'phone' ? form.phone : null}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
          onClose={resetOtp}
          loading={otpLoading}
        />
      )}
    </>
  );
}
