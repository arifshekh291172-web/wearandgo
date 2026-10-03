import React from 'react';
import { CheckCircle2, Circle, Clock, Truck, Package, Home, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/formatters';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PACKED', label: 'Packed', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export const OrderTimeline = ({ orderStatus, timeline = [], cancelled = false, returnStatus = false }) => {
  if (cancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-4">
        <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-rose-900 text-sm">Order Cancelled</h4>
          <p className="text-xs text-rose-700 mt-1">
            This order has been cancelled. Any amounts charged have been initiated for refund.
          </p>
        </div>
      </div>
    );
  }

  if (returnStatus) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 text-sm">
            {orderStatus === 'RETURNED' ? 'Order Returned & Refunded' : 'Return In Progress'}
          </h4>
          <p className="text-xs text-amber-700 mt-1">
            Our courier partner will inspect the items during doorstep pickup.
          </p>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === orderStatus);
  const activeIndex = currentStepIndex > -1 ? currentStepIndex : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 md:p-6 space-y-6">
      <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
        Tracking Status
      </h3>

      {/* Horizontal Steps on desktop, vertical on mobile */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-slate-900 -z-0 transition-all duration-500"
          style={{
            width: `${(activeIndex / (STATUS_STEPS.length - 1)) * 90}%`,
          }}
        />

        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 text-center max-w-[100px]">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-amber-200' : ''}`}
              >
                <StepIcon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] font-bold mt-2 leading-tight ${
                  isDone ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical Timeline on Mobile & Detailed Logs */}
      <div className="space-y-4 pt-2">
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Activity Log
          </h4>
          <div className="space-y-3">
            {timeline.slice().reverse().map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{event.status.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(event.date)}
                    </span>
                  </div>
                  {event.note && (
                    <p className="text-slate-500 text-[11px] mt-0.5">{event.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
