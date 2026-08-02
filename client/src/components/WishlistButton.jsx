import React from 'react';
import { useAuth } from '../context/AuthContext';

const HeartIcon = ({ className = "w-4 h-4", filled = false }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const WishlistButton = ({
  listingId,
  variant = 'icon', // 'icon' | 'pill'
  size = 'md',
  className = ''
}) => {
  const { token, wishlist, toggleWishlist, showAuthModal } = useAuth();
  const isSaved = Boolean(wishlist && listingId && wishlist.includes(listingId.toString()));

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!listingId) return;

    if (!token) {
      showAuthModal('login', () => toggleWishlist(listingId.toString()), {
        title: 'Saved List',
        description: 'Log in or sign up to add this vehicle to your wishlist.'
      });
    } else {
      toggleWishlist(listingId.toString());
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
        title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
        className={`grid h-9 w-9 place-items-center rounded-full border bg-surface/95 shadow-sm backdrop-blur transition-all hover:scale-105 cursor-pointer z-10 select-none ${
          isSaved
            ? 'border-red-500/40 text-red-500 bg-red-500/10'
            : 'border-border text-textSecondary hover:text-red-500 hover:border-red-500/40'
        } ${className}`}
      >
        <HeartIcon className="w-4 h-4" filled={isSaved} />
      </button>
    );
  }

  // 'pill' variant (e.g., used on ListingDetail page top bar)
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all shadow-sm cursor-pointer select-none ${
        isSaved 
          ? 'border-red-500/40 bg-red-500/10 text-red-500' 
          : 'border-border bg-surface text-textSecondary hover:border-border/80 hover:text-textPrimary'
      } ${className}`}
    >
      <HeartIcon className={`w-4 h-4 ${isSaved ? 'fill-current text-red-500' : 'text-red-500'}`} filled={isSaved} />
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  );
};

export default WishlistButton;
