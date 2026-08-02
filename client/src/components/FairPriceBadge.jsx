import React from 'react';

const CheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const TrendingDownIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-3.182m-3.182 3.182l-2.898-.776" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.286 4.286a11.948 11.948 0 004.306-6.43l.776-2.898m0 0l3.182 3.182m-3.182-3.182l-2.898.776" />
  </svg>
);

const FairPriceBadge = ({ verdict, delta, className = "" }) => {
  if (verdict === 'under') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none ${className}`}>
        <TrendingDownIcon className="w-3.5 h-3.5" />
        Below market
        {typeof delta === 'number' && <span className="font-mono opacity-80">{delta}%</span>}
      </span>
    );
  }

  if (verdict === 'over') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 select-none ${className}`}>
        <TrendingUpIcon className="w-3.5 h-3.5" />
        Above market
        {typeof delta === 'number' && <span className="font-mono opacity-80">+{delta}%</span>}
      </span>
    );
  }

  if (verdict === 'fair') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none ${className}`}>
        <CheckIcon className="w-3.5 h-3.5" />
        Fair price
      </span>
    );
  }

  // Fallback when value is not available
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none ${className}`}>
      <CheckIcon className="w-3.5 h-3.5" />
      Fair Price N/A
    </span>
  );
};

export default FairPriceBadge;
