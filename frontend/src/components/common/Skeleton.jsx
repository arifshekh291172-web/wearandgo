import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-200/80 rounded-lg ${className}`}
      {...props}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden p-3 space-y-3">
      <Skeleton className="w-full aspect-[3/4] rounded-xl" />
      <div className="space-y-1.5 px-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
      <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default Skeleton;
