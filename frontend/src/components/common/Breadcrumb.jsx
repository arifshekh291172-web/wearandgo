import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 text-xs md:text-sm text-slate-500">
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center text-slate-400 hover:text-slate-800 transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              {isLast || !item.link ? (
                <span className="font-semibold text-slate-800 truncate max-w-[200px] md:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.link}
                  className="hover:text-slate-800 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
