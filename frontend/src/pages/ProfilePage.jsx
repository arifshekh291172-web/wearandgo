import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Modal } from '../components/common/Modal';
import { authService } from '../services/authService';
import { INDIAN_STATES } from '../utils/config';

export const ProfilePage = () => {
  const { user, isAuthenticated, loading, updateProfile, addAddress, deleteAddress } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  // Add Address Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseBuilding: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    isDefault: false,
  });

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login?redirect=/profile" replace />;
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateProfile({ name, phone });
    setProfileSaving(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setPwSaving(true);
      const res = await authService.updatePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPwSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const res = await addAddress(addressForm);
    if (res.success) {
      setAddressModalOpen(false);
      setAddressForm({
        fullName: user?.name || '',
        phone: user?.phone || '',
        houseBuilding: '',
        street: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        landmark: '',
        isDefault: false,
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'My Account' }, { label: 'Profile' }]} />

      <div className="pb-4 border-b border-slate-100">
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">
          Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, security credentials, and saved addresses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Personal Details Form */}
        <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-amber-700" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="py-3 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Security & Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={pwSaving}
              className="py-3 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>
      </div>

      {/* Saved Addresses Section */}
      <section className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-700" />
            <span>Saved Addresses</span>
          </h3>
          <button
            onClick={() => setAddressModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Address</span>
          </button>
        </div>

        {user?.addresses && user.addresses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {addr.houseBuilding}, {addr.street}<br />
                    {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">Mobile: {addr.phone}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                  <button
                    onClick={() => deleteAddress(addr._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No saved addresses yet.</p>
          </div>
        )}
      </section>

      {/* Add Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title="Add Delivery Address"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Flat / House / Building *
              </label>
              <input
                type="text"
                required
                value={addressForm.houseBuilding}
                onChange={(e) => setAddressForm({ ...addressForm, houseBuilding: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Street / Area *
              </label>
              <input
                type="text"
                required
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                State *
              </label>
              <select
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Pincode *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
