import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import API from '../api/axios';

/* ── helpers ── */
const getProfile    = ()     => API.get('/user/profile');
const patchProfile  = (data) => API.patch('/user/profile', data);
const sendOtp       = (p)    => API.post('/user/send-otp', p);
const verifyOtp     = (p)    => API.post('/user/verify-otp', p);
const addAddress    = (d)    => API.post('/user/addresses', d);
const updateAddress = (id,d) => API.put(`/user/addresses/${id}`, d);
const deleteAddress = (id)   => API.delete(`/user/addresses/${id}`);

export default function useProfile() {
  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [otpSent, setOtpSent]         = useState(false);
  const [otpPurpose, setOtpPurpose]   = useState(null);
  const [otpTarget, setOtpTarget]     = useState(null);
  const [otpLoading, setOtpLoading]   = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode]         = useState('');

  /* ── fetch ── */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setProfile(res.data);
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── save basic fields (firstName, lastName) ── */
  const saveBasicInfo = async (data) => {
    try {
      setSaving(true);
      const res = await patchProfile(data);
      setProfile(res.data);
      toast.success('Profile updated! ✓');
      return true;
    } catch (err) {
      toast.error(err?.userMessage || err?.response?.data?.message || 'Update failed.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  /* ── OTP send ── */
  const requestOtp = async (purpose, targetValue = null) => {
    try {
      setOtpLoading(true);
      await sendOtp({ purpose, targetValue });
      setOtpPurpose(purpose);
      setOtpTarget(targetValue);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpCode('');
      toast.success('OTP sent! Check your email / phone.');
    } catch (err) {
      toast.error(err?.userMessage || err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── OTP verify ── */
  const confirmOtp = async (code) => {
    try {
      setOtpLoading(true);
      await verifyOtp({ purpose: otpPurpose, otpCode: code });
      setOtpVerified(true);
      setOtpCode(code);
      toast.success('OTP verified ✓');
      return true;
    } catch (err) {
      toast.error(err?.userMessage || err?.response?.data?.message || 'Invalid OTP.');
      return false;
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── save sensitive field (email / phone / password) after OTP ── */
  const saveSensitiveField = async (fieldData) => {
    if (!otpVerified) { toast.error('Please verify OTP first.'); return false; }
    try {
      setSaving(true);
      const res = await API.put('/user/profile/update', {
        ...fieldData,
        verifiedOtpCode: otpCode,
        otpPurpose,
      });
      setProfile(res.data);
      resetOtp();
      toast.success('Updated successfully!');
      return true;
    } catch (err) {
      toast.error(err?.userMessage || err?.response?.data?.message || 'Update failed.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtpPurpose(null);
    setOtpTarget(null);
    setOtpVerified(false);
    setOtpCode('');
  };

  /* ── addresses ── */
  const addAddr = async (data) => {
    try {
      setSaving(true);
      await addAddress(data);
      await fetchProfile();
      toast.success('Address added!');
      return true;
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to add address.');
      return false;
    } finally { setSaving(false); }
  };

  const updateAddr = async (id, data) => {
    try {
      setSaving(true);
      await updateAddress(id, data);
      await fetchProfile();
      toast.success('Address updated!');
      return true;
    } catch (err) {
      toast.error(err?.userMessage || 'Failed to update address.');
      return false;
    } finally { setSaving(false); }
  };

  const deleteAddr = async (id) => {
    try {
      setSaving(true);
      await deleteAddress(id);
      await fetchProfile();
      toast.success('Address removed.');
      return true;
    } catch (err) {
      toast.error('Failed to delete address.');
      return false;
    } finally { setSaving(false); }
  };

  return {
    profile, loading, saving, fetchProfile, saveBasicInfo,
    otpSent, otpPurpose, otpTarget, otpLoading, otpVerified,
    requestOtp, confirmOtp, saveSensitiveField, resetOtp,
    addAddr, updateAddr, deleteAddr,
  };
}
