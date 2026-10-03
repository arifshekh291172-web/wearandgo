import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900" />
        <p className="text-sm font-medium text-slate-500 tracking-wide">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 space-x-2 text-slate-600">
      <Loader2 className="w-5 h-5 animate-spin text-slate-800" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};export default Loader;
