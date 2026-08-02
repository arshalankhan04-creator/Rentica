import React from 'react';
import { useCompare } from '../context/CompareContext';

const GitCompareArrowsIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m-3-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const CheckIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const CompareButton = ({
  listing,
  variant = 'pill', // 'pill' | 'card'
  className = ''
}) => {
  const { isInCompare, addToCompare, removeFromCompare, filledCount, MAX_COMPARE } = useCompare();

  if (!listing) return null;
  const targetId = (listing._id || listing.id || '').toString();
  const isCompared = isInCompare(targetId);
  const compareFull = filledCount >= MAX_COMPARE && !isCompared;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(listing);
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromCompare(listing);
  };

  // State A: Already added to comparison — render active badge with explicit remove (X) button
  if (isCompared) {
    return (
      <div className={`inline-flex items-center rounded-full border border-primary/40 bg-primary text-white text-xs font-semibold overflow-hidden shadow-sm select-none shrink-0 ${className}`}>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 cursor-default">
          <CheckIcon className="w-3.5 h-3.5 text-white" />
          <span>Added</span>
        </span>
        <button
          type="button"
          onClick={handleRemove}
          title="Remove from comparison"
          aria-label="Remove from comparison"
          className="px-2 py-1.5 bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors cursor-pointer border-l border-white/20 flex items-center justify-center font-bold"
        >
          ✕
        </button>
      </div>
    );
  }

  // State B: Not added yet — render action button to add
  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={compareFull}
      title={compareFull ? "Comparison slots full (3/3) — remove a vehicle first" : "Add to comparison"}
      className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold transition-all shadow-sm cursor-pointer select-none ${
        compareFull
          ? 'border-border bg-surface text-textSecondary/40 cursor-not-allowed opacity-60'
          : 'border-border bg-surface text-textSecondary hover:border-primary/50 hover:text-primary hover:bg-primary/5'
      } ${className}`}
    >
      <GitCompareArrowsIcon className="w-4 h-4" />
      <span>Compare</span>
    </button>
  );
};

export default CompareButton;
