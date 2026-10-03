import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import { RotateCcw, Clock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

const ReturnPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[{ label: 'Return & Refund Policy' }]} />

      <div className="text-center my-8">
        <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
          <RotateCcw className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Return & Refund Policy</h1>
        <p className="text-neutral-500 mt-2">Hassle-free 7-day returns on your orders</p>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-neutral-200 shadow-sm space-y-8">
        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-neutral-100">
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-neutral-50">
            <Clock className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-neutral-900 text-sm">7-Day Window</p>
              <p className="text-xs text-neutral-500">From date of delivery</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-neutral-50">
            <RotateCcw className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-neutral-900 text-sm">Free Pickups</p>
              <p className="text-xs text-neutral-500">Across 19,000+ PIN codes</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 rounded-xl bg-neutral-50">
            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-neutral-900 text-sm">Fast Refunds</p>
              <p className="text-xs text-neutral-500">Processed within 3-5 days</p>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">1. Return Eligibility</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            At Wear & Go, we want you to love what you wear. If something isn't right, you can initiate a return or exchange request within 7 calendar days from the date of delivery.
          </p>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
              Items must be unworn, unwashed, and undamaged with all original tags attached.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
              Products must be returned in their original packaging including brand boxes, dust bags, and polybags.
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
              For hygiene reasons, innerwear, socks, swimwear, and customized/personalized items are non-returnable.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">2. How to Request a Return</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            Initiating a return is quick and can be done entirely through your account:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-600">
            <li>Go to <strong>My Orders</strong> in your Wear & Go account.</li>
            <li>Select the eligible order and click on <strong>Request Return</strong>.</li>
            <li>Choose the item(s), reason for return, and preferred resolution (Exchange or Refund).</li>
            <li>Hand over the package with all original tags to our courier partner during the scheduled pickup.</li>
          </ol>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">3. Refund Processing</h2>
          <p className="text-neutral-600 text-sm leading-relaxed mb-4">
            Once our warehouse receives the returned item, it undergoes a quality inspection within 24-48 hours. Upon successful verification:
          </p>
          <div className="bg-neutral-50 p-4 rounded-xl space-y-2 text-sm text-neutral-700">
            <p><strong>Prepaid Orders (UPI, Cards, NetBanking):</strong> Refund is credited directly to the original payment source within 3-5 business days.</p>
            <p><strong>Cash on Delivery (COD) Orders:</strong> A secure bank transfer link (NEFT/IMPS) will be sent to your registered mobile and email to deposit the refund within 2-3 business days.</p>
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-lg font-bold text-neutral-900 mb-3">4. Damaged or Defective Items</h2>
          <div className="flex items-start p-4 rounded-xl bg-amber-50 text-amber-800 text-sm space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              In the unlikely event that you receive a damaged, defective, or incorrect product, please notify us within 48 hours of delivery via our <a href="/contact" className="underline font-semibold">Contact Us</a> page or email at <strong>support@wearandgo.com</strong> with photos of the issue.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
