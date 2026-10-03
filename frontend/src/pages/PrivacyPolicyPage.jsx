import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

      <div className="text-center my-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Privacy Policy</h1>
        <p className="text-neutral-500 mt-2">Last updated: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-8 text-neutral-600 leading-relaxed text-sm">
        <p>
          Wear & Go ("we", "us", or "our") is dedicated to safeguarding your privacy and ensuring your personal information is handled in a safe, transparent, and responsible manner. This policy details how we collect, store, and process your information when you browse our website or make purchases.
        </p>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary" />
            <span>1. Information We Collect</span>
          </h2>
          <p className="mb-2">We collect information to provide and enhance our e-commerce services:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Personal Identity:</strong> Name, phone number, email address, shipping and billing addresses.</li>
            <li><strong>Order Data:</strong> Items purchased, sizes, colors, payment transaction identifiers, and order history.</li>
            <li><strong>Device & Browsing Info:</strong> IP address, device type, browser information, and visited pages to optimize performance.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>2. How We Protect Payment Information</span>
          </h2>
          <p>
            Wear & Go does NOT store or process your credit/debit card numbers or bank credentials on our servers. All online transactions are handled through PCI-DSS compliant, RBI-licensed payment gateways (Razorpay) utilizing bank-grade 256-bit encryption.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>3. How We Use Your Information</span>
          </h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Processing and delivering your orders.</li>
            <li>Sending order confirmations, tracking SMS, and shipment notifications.</li>
            <li>Providing customer support and processing returns.</li>
            <li>Preventing fraudulent transactions and unauthorized account access.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">4. Sharing with Third Parties</h2>
          <p>
            We never sell, rent, or trade your personal data. We only share essential details with certified logistics partners (BlueDart, Delhivery, etc.) for delivering your orders and technology providers needed to operate our platform securely.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">5. Contact Our Privacy Officer</h2>
          <p>
            For any queries or data access requests under Indian Information Technology (IT) guidelines, contact us at <strong>privacy@wearandgo.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
