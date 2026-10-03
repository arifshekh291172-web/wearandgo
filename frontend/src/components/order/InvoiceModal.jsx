import React, { useRef } from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/formatters';
import { STORE_CONFIG } from '../../utils/config';

export const InvoiceModal = ({ isOpen, onClose, order }) => {
  const invoiceRef = useRef(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice" maxWidth="max-w-2xl">
      <div className="space-y-6 text-slate-800" ref={invoiceRef}>
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Wear & Go"
              className="h-14 w-auto object-contain"
            />
            <div>
              <h2 className="text-xl font-black font-serif text-slate-950">
                WEAR & GO
              </h2>
              <p className="text-xs text-slate-500">{STORE_CONFIG.tagline}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                GSTIN: 27AABCT1332M1ZG<br />
                {STORE_CONFIG.address}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 uppercase tracking-widest">
              TAX INVOICE
            </span>
            <p className="text-xs font-mono font-bold text-slate-900 mt-2">
              #{order.orderId}
            </p>
            <p className="text-xs text-slate-500">
              Date: {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Billed To / Shipped To */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
              Customer Details
            </h4>
            <p className="font-semibold text-slate-800">{order.shippingAddress.fullName}</p>
            <p className="text-slate-600">Phone: {order.shippingAddress.phone}</p>
            <p className="text-slate-600">{order.shippingAddress.email}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">
              Delivery Address
            </h4>
            <p className="text-slate-600">
              {order.shippingAddress.houseBuilding}, {order.shippingAddress.street}
            </p>
            <p className="text-slate-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3 text-center">Size</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-medium text-slate-900">
                    {item.name}
                    {item.color && item.color !== 'Default' && (
                      <span className="text-[11px] text-slate-400 block">Color: {item.color}</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold">{item.size}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">{formatPrice(item.price)}</td>
                  <td className="p-3 text-right font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount {order.coupon?.code ? `(${order.coupon.code})` : ''}:</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-slate-900">
                {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="font-semibold text-slate-900">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-950">
              <span>Total Amount:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>Payment Mode:</span>
              <span className="uppercase">{order.paymentMethod} ({order.paymentStatus})</span>
            </div>
          </div>
        </div>

        {/* Footer info & Print Button */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">
            This is a computer-generated tax invoice. No signature required.
          </p>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceModal;
