import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 0, size = 'sm', showNumber = true, reviewCount }) => {
  const iconSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-200 fill-slate-100'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-400">({reviewCount})</span>
      )}
    </div>
  );
};

export default RatingStars;
