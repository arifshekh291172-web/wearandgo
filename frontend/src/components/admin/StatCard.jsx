import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, trend = 'neutral', color = 'slate' }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-800 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center text-xs">
          <span
            className={`font-semibold ${
              trend === 'up'
                ? 'text-emerald-600'
                : trend === 'down'
                ? 'text-rose-600'
                : 'text-slate-500'
            }`}
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
