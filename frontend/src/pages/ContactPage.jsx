import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import { productService } from '../services/productService';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { STORE_CONFIG } from '../utils/config';

export const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await productService.submitContact(formData);
      if (res.success) {
        toast.success(res.message);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      <Breadcrumb items={[{ label: 'Contact Us' }]} />

      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
          We're Here For You
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-950">
          Get in Touch
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions regarding an order, size guidance, or delivery? Our dedicated customer care team is available 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Email Us</h4>
              <p className="text-xs text-slate-600">{STORE_CONFIG.supportEmail}</p>
              <p className="text-[11px] text-slate-400">Response within 2 hours</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Call Customer Care</h4>
              <p className="text-xs text-slate-600">{STORE_CONFIG.supportPhone}</p>
              <p className="text-[11px] text-slate-400">Mon - Sat: 9:00 AM - 8:00 PM</p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">WhatsApp Support</h4>
              <p className="text-xs text-slate-600">Quick answers on sizing & orders</p>
              <a
                href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-emerald-700 underline"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-slate-100 text-slate-800 rounded-xl shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Flagship Studio</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{STORE_CONFIG.address}</p>
            </div>
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Send Us a Direct Message</h3>

          {submitted ? (
            <div className="py-12 text-center space-y-4 bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950">Message Sent Successfully!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for reaching out to Wear & Go. Our customer care team has received your ticket and will follow up with you promptly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Order Delivery Status / Size Query"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="py-3.5 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{submitting ? 'SENDING MESSAGE...' : 'SEND INQUIRY'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
