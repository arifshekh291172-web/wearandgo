import React from 'react';
import { Breadcrumb } from '../components/common/Breadcrumb';

export const ShippingPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumb items={[{ label: 'Shipping Policy' }]} />
      <h1 className="text-3xl font-black font-serif text-slate-950 pb-4 border-b border-slate-100">
        Shipping & Delivery Policy
      </h1>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Pan-India Delivery Network</h3>
        <p>
          Wear & Go delivers to over 19,000 PIN codes across India. All shipments are managed via our tier-1 logistics partners including Blue Dart, Delhivery Express, and DTDC.
        </p>

        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Shipping Charges & Free Shipping Threshold</h3>
        <p>
          We offer <strong>FREE STANDARD EXPRESS SHIPPING</strong> on all orders with a cart subtotal of <strong>₹999 and above</strong>. For orders under ₹999, a nominal flat shipping fee of <strong>₹99</strong> is applied to cover courier freight.
        </p>

        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Order Processing & Dispatch Timelines</h3>
        <p>
          Orders confirmed before 2:00 PM IST on business days are dispatched on the same day. All other orders are packaged and handed over to courier carriers within 24 business hours.
        </p>

        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">4. Estimated Delivery Times</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Mumbai & Metropolitan Cities:</strong> 1 to 2 business days.</li>
          <li><strong>State Capitals & Tier-1 Cities:</strong> 2 to 4 business days.</li>
          <li><strong>Tier-2 / Tier-3 Cities & Regional Areas:</strong> 3 to 6 business days.</li>
        </ul>

        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">5. Tracking Your Shipment</h3>
        <p>
          Once your package is dispatched, you will receive an automated SMS and email containing your tracking AWB number. You can also view live delivery timeline milestones inside the <strong>My Orders</strong> page on our platform.
        </p>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
