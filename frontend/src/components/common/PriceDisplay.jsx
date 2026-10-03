import React from 'react';
import { formatPrice } from '../../utils/formatters';

export const PriceDisplay = ({
  price,
  discountPrice,
  discountPercentage,
  size = 'md',
  className = '',
}) => {
  const currentPrice = discountPrice || price;
  const hasDiscount = discountPrice && discountPrice < price;

  const currentSizeClass =
    size === 'lg'
      ? 'text-2xl font-bold text-slate-950'
      : size === 'sm'
      ? 'text-sm font-bold text-slate-950'
      : 'text-base font-bold text-slate-950';

  const originalSizeClass =
    size === 'lg'
      ? 'text-base text-slate-400 line-through'
      : size === 'sm'
      ? 'text-xs text-slate-400 line-through'
      : 'text-xs text-slate-400 line-through';

  const badgeSizeClass =
    size === 'lg'
      ? 'text-xs font-semibold px-2 py-0.5'
      : 'text-[11px] font-semibold px-1.5 py-0.5';

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={currentSizeClass}>{formatPrice(currentPrice)}</span>
      {hasDiscount && (
        <>
          <span className={originalSizeClass}>{formatPrice(price)}</span>
          <span
            className={`${badgeSizeClass} bg-amber-50 text-amber-800 border border-amber-200/60 rounded-md`}
          >
            {discountPercentage}% OFF
          </span>
        </>
      )}
    </div>
  );
};

export default PriceDisplay;
