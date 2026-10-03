import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';

export const MobileFilterDrawer = ({ isOpen, onClose, totalResults, ...filterProps }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">FILTERS</h3>
            {totalResults !== undefined && (
              <span className="text-xs text-slate-400">({totalResults} items)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          <FilterSidebar {...filterProps} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white text-xs font-bold uppercase rounded-xl tracking-wider hover:bg-slate-800 active:scale-95 transition-all shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
