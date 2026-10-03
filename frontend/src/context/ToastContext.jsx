import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
  };
  toast.toast = toast;

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container floating on top right / bottom on mobile */}
      <div className="fixed z-50 bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          let bgClass = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

          if (t.type === 'success') {
            bgClass = 'bg-slate-900 border-slate-800 text-white';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (t.type === 'error') {
            bgClass = 'bg-red-950 border-red-800 text-red-50';
            icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
          } else if (t.type === 'warning') {
            bgClass = 'bg-amber-950 border-amber-800 text-amber-50';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 transform translate-y-0 ${bgClass}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 hover:opacity-75 transition-opacity ml-2 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
