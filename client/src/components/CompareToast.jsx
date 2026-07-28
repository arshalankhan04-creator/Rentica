import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  added: (
    <div className="w-8 h-8 rounded-full bg-success/15 border border-success/30 flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  full: (
    <div className="w-8 h-8 rounded-full bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
  ),
  already_in: (
    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ),
};

const MESSAGES = {
  added:      (name) => ({ title: 'Added to comparison', sub: name }),
  full:       ()     => ({ title: 'Comparison is full (3/3)', sub: 'Remove a car first to add another.' }),
  already_in: (name) => ({ title: 'Already in comparison', sub: name }),
};

const CompareToast = ({ toast, onDismiss }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  // Trigger entry animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const { type, listing } = toast;
  const carName = listing ? `${listing.year} ${listing.brand} ${listing.model}` : '';
  const msg = MESSAGES[type]?.(carName) ?? { title: '', sub: '' };
  const isAdded = type === 'added';

  const handleNavigate = () => {
    onDismiss();
    navigate('/compare');
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] w-[320px] max-w-[calc(100vw-3rem)] transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        {isAdded && (
          <div className="h-0.5 bg-primary/10">
            <div
              className="h-full bg-primary origin-left"
              style={{ animation: 'shrink-bar 3.5s linear forwards' }}
            />
          </div>
        )}

        <div className="flex items-start gap-3 p-4">
          {ICONS[type]}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-textPrimary m-0 leading-tight">{msg.title}</p>
            <p className="text-[11px] text-textSecondary font-semibold mt-0.5 leading-snug truncate m-0">{msg.sub}</p>

            {isAdded && (
              <button
                onClick={handleNavigate}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primaryHover transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                View Comparison
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="text-textSecondary/60 hover:text-textPrimary bg-transparent border-none cursor-pointer p-0.5 rounded-lg hover:bg-muted transition-colors shrink-0 focus:outline-none"
            aria-label="Dismiss"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareToast;
