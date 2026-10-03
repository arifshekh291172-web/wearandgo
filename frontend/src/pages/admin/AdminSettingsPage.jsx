import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Mail, Phone, IndianRupee } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { SITE_CONFIG } from '../../utils/config';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    name: SITE_CONFIG.name || 'Wear & Go',
    tagline: SITE_CONFIG.tagline || 'Style That Moves With You.',
    email: SITE_CONFIG.contact?.email || 'support@wearandgo.com',
    phone: SITE_CONFIG.contact?.phone || '+91 98765 43210',
    whatsapp: SITE_CONFIG.contact?.whatsapp || '+91 98765 43210',
    freeShippingThreshold: SITE_CONFIG.freeShippingThreshold || 999,
    standardShippingFee: SITE_CONFIG.standardShippingFee || 99,
    taxRate: 5,
    returnWindowDays: 7,
    instagram: SITE_CONFIG.social?.instagram || 'https://instagram.com/wearandgo',
    facebook: SITE_CONFIG.social?.facebook || 'https://facebook.com/wearandgo',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Store configuration saved successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Business & Store Settings</h1>
        <p className="text-xs text-neutral-500 mt-1">Configure global store branding, checkout thresholds, and support contacts</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Store Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                name="name"
                value={config.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={config.tagline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* E-Commerce Thresholds & Taxes */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center space-x-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            <span>Shipping & Taxes (India)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Free Shipping Above (₹)
              </label>
              <input
                type="number"
                name="freeShippingThreshold"
                value={config.freeShippingThreshold}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Standard Shipping (₹)
              </label>
              <input
                type="number"
                name="standardShippingFee"
                value={config.standardShippingFee}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                GST Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={config.taxRate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Return Period (Days)
              </label>
              <input
                type="number"
                name="returnWindowDays"
                value={config.returnWindowDays}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>Support & Social Channels</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Customer Email
              </label>
              <input
                type="email"
                name="email"
                value={config.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Support Phone
              </label>
              <input
                type="text"
                name="phone"
                value={config.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                WhatsApp Hotline
              </label>
              <input
                type="text"
                name="whatsapp"
                value={config.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Instagram Profile Link
              </label>
              <input
                type="url"
                name="instagram"
                value={config.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Facebook Profile Link
              </label>
              <input
                type="url"
                name="facebook"
                value={config.facebook}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-colors text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
