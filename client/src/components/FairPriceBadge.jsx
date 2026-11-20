import React from 'react';

const CheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const TagIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

// GREAT_DEAL_THRESHOLD: listings with pricePerDay at or below this value show the badge
const GREAT_DEAL_THRESHOLD = 60;

/**
 * FairPriceBadge — repurposed as "Great Deal" badge for Rentica.
 * Shows a "Great Deal" badge when pricePerDay is below the threshold.
 * Props:
 *   pricePerDay  — number, the daily rental price
 *   verdict      — optional legacy prop (ignored, kept for API compatibility)
 *   delta        — optional legacy prop (ignored)
 *   className    — extra CSS classes
 */
const FairPriceBadge = ({ pricePerDay, verdict, delta, className = "" }) => {
  const isGreatDeal = typeof pricePerDay === 'number' && pricePerDay <= GREAT_DEAL_THRESHOLD;

  if (isGreatDeal) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none ${className}`}>
        <TagIcon className="w-3.5 h-3.5" />
        Great Deal
      </span>
    );
  }

  // No badge when price is above threshold or unknown
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-border/40 bg-background px-2.5 py-1 text-xs font-medium text-textSecondary/60 select-none ${className}`}>
      <CheckIcon className="w-3.5 h-3.5" />
      Available
    </span>
  );
};

export default FairPriceBadge;
