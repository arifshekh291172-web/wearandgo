import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Breadcrumb } from '../components/common/Breadcrumb';

const FAQS = [
  {
    q: 'How long does delivery take across India?',
    a: 'We dispatch all orders within 24 hours from our Mumbai fulfillment center. Metros typically receive delivery within 2–3 business days. Tier-2 and tier-3 cities receive orders within 3–5 business days via Blue Dart and Delhivery Express.',
  },
  {
    q: 'What is Wear & Go’s return and exchange policy?',
    a: 'We offer an easy 7-day hassle-free return and exchange policy. If an item doesn’t fit or meet your expectations, simply navigate to "My Orders", click "Request 7-Day Return", and our courier partner will schedule a doorstep reverse pickup.',
  },
  {
    q: 'Is Cash on Delivery (COD) available?',
    a: 'Yes, Cash on Delivery is available across 19,000+ Indian PIN codes with zero additional handling fees.',
  },
  {
    q: 'What payment methods do you accept online?',
    a: 'We accept all major UPI apps (Google Pay, PhonePe, Paytm), Visa, Mastercard, RuPay, American Express, Net Banking across all Indian banks, and digital wallets via our secure Razorpay integration.',
  },
  {
    q: 'How do I choose the correct size?',
    a: 'Every product page features an interactive "Size Guide" button with exact measurements in inches and cm for chest, waist, and garment length. Our oversized collections are engineered with relaxed drop-shoulder cuts.',
  },
  {
    q: 'How do I track my active order?',
    a: 'Once your order is dispatched, you will receive an SMS and email notification with an AWB tracking number. You can also track the real-time status timeline directly in the "My Orders" tab on our website.',
  },
];

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Breadcrumb items={[{ label: 'FAQ' }]} />

      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">
          Got Questions?
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-950">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-slate-500">
          Everything you need to know about sizing, ordering, payments, and reverse logistics.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-amber-800 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-slate-900' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQPage;
