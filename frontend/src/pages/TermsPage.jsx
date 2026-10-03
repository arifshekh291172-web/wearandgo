import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { FileCheck, AlertTriangle, Scale } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[{ label: 'Terms & Conditions' }]} />

      <div className="text-center my-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Terms & Conditions</h1>
        <p className="text-neutral-500 mt-2">Effective date: October 2026</p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-8 text-neutral-600 leading-relaxed text-sm">
        <p>
          Welcome to <strong>Wear & Go</strong>. By accessing or purchasing from our platform, you agree to comply with and be bound by the following Terms & Conditions. Please read them thoroughly before making a purchase.
        </p>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-primary" />
            <span>1. Account Registration & Security</span>
          </h2>
          <p>
            When creating an account, you must provide accurate, current, and complete details. You are solely responsible for maintaining the confidentiality of your account credentials and password. Wear & Go reserves the right to suspend or terminate accounts engaging in suspicious, fraudulent, or abusive activity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">2. Product Information & Pricing</h2>
          <p>
            All prices are quoted in Indian Rupees (₹ INR) and include applicable taxes (GST) unless indicated otherwise. While we strive for extreme accuracy in product imagery, fabric descriptions, and sizing measurements, minor color variations may occur depending on screen displays.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">3. Orders & Payment</h2>
          <p>
            An order confirmation email is sent immediately upon successful checkout. We accept secure prepaid transactions via Razorpay (UPI, Credit/Debit cards, Net Banking) and Cash on Delivery (COD) on eligible PIN codes. For COD orders, our team reserves the right to perform verification before dispatch.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <span>4. Intellectual Property</span>
          </h2>
          <p>
            The Wear & Go logo, trademarks, custom product designs, website visuals, and photography are the intellectual property of Wear & Go. Any reproduction, distribution, or unauthorized commercial use is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">5. Governing Law</h2>
          <p>
            These Terms & Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of India.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
