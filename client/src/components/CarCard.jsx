import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

const CarCard = ({ car }) => {
  // Handle image URL
  let imageUrl = null;
  if (car.image) {
    imageUrl = car.image; // Static dummy image
  } else if (car.images && car.images.length > 0) {
    // Backend image
    const rawImage = car.images[0];
    if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
      imageUrl = rawImage;
    } else {
      imageUrl = `http://localhost:5000/${rawImage}`;
    }
  }

  // Handle price formatting
  let priceMinStr = car.priceMinText;
  let priceMaxStr = car.priceMaxText;
  if (!priceMinStr && !priceMaxStr && car.price) {
    // If it's a backend listing, format the price!
    const lakhs = car.price / 100000;
    priceMinStr = `₹${lakhs.toFixed(1)}L`;
    if (car.predictedPriceMin && car.predictedPriceMax) {
      priceMinStr = `₹${(car.predictedPriceMin / 100000).toFixed(1)}L`;
      priceMaxStr = `₹${(car.predictedPriceMax / 100000).toFixed(1)}L`;
    }
  }

  // Handle mileage / kmDriven
  const mileageText = car.mileage || (car.kmDriven !== undefined ? `${car.kmDriven.toLocaleString()} km` : 'N/A');

  // Handle gradient
  const cardGradient = car.gradient || 'from-slate-700 to-slate-900';

  // Handle trust score
  const displayTrustScore = car.trustScore !== null && car.trustScore !== undefined ? car.trustScore : 'N/A';

  const getCarLocation = () => {
    if (car.location) return car.location;
    const b = car.brand ? car.brand.toLowerCase() : '';
    if (b.includes('mercedes') || b.includes('benz')) return 'Mumbai, Maharashtra';
    if (b.includes('audi')) return 'Delhi NCR';
    if (b.includes('hyundai')) return 'Delhi NCR';
    if (b.includes('honda')) return 'Bangalore, Karnataka';
    if (b.includes('toyota')) return 'Pune, Maharashtra';
    return 'Mumbai, Maharashtra';
  };

  // Handle posted date
  const displayDate = car.postedDate || (car.createdAt ? `Posted ${new Date(car.createdAt).toLocaleDateString()}` : 'Recently posted');

  // Handle target ID
  const targetId = car.id || car._id;

  const { token, wishlist, toggleWishlist } = useAuth();
  const { addToCompare, isInCompare, filledCount, MAX_COMPARE } = useCompare();
  const navigate = useNavigate();
  const isSaved = wishlist.includes(targetId);

  // Only show Compare button for real API listings (have _id)
  const isRealListing = Boolean(car._id);
  const alreadyComparing = isRealListing && isInCompare(targetId);
  const compareFull = filledCount >= MAX_COMPARE && !alreadyComparing;

  return (
    <Link 
      to={`/listings/${targetId}`} 
      className="bg-surface border border-border rounded-card-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer no-underline text-inherit"
    >
      {/* Image / Header Zone */}
      <div className="w-full h-40 relative overflow-hidden bg-background">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${car.brand} ${car.model}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${cardGradient} flex items-center justify-center`}>
            <span className="text-white/20 font-bold text-6xl select-none tracking-widest uppercase">
              {car.brand ? car.brand.substring(0, 3) : 'CAR'}
            </span>
          </div>
        )}
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Favorite/Wishlist Heart Button (Top-Right) */}
        <button 
          onClick={(e) => {
            e.preventDefault(); // Don't trigger link navigation
            e.stopPropagation();
            toggleWishlist(targetId);
          }}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-surface flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform duration-200 border border-border/40 focus:outline-none z-10"
        >
          <svg 
            className={`w-5 h-5 transition-colors ${isSaved ? 'text-red-500 fill-current' : 'text-textSecondary hover:text-red-500'}`} 
            viewBox="0 0 24 24" 
            fill={isSaved ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Trust Score Badge (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 bg-surface px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 border border-border/30 z-10 select-none">
          <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-11px font-bold text-primary">
            {displayTrustScore}
          </div>
          <span className="text-2xs font-bold text-textSecondary uppercase tracking-wider">
            Trust Score
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex flex-col flex-1 text-left">
        {/* Title */}
        <h4 className="text-card-title m-0 truncate leading-snug">
          {car.year} {car.brand} {car.model}
        </h4>

        {/* Price Range */}
        <div className="flex items-baseline gap-1 mt-1.5 select-none">
          <span className="text-lg font-semibold text-textPrimary leading-none">
            {priceMinStr}
          </span>
          {priceMaxStr && (
            <>
              <span className="text-xs font-semibold text-textSecondary mx-0.5">
                -
              </span>
              <span className="text-sm font-semibold text-textSecondary">
                {priceMaxStr}
              </span>
            </>
          )}
        </div>

        {/* 2x2 Specs Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-2.5 mb-3.5">
          {/* Mileage / kmDriven */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary">
            <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V12h6" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>{mileageText}</span>
          </div>

          {/* Fuel Type */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary">
            <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 18V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h13a1 1 0 001-1zM14 8h-4m-2 4h8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11l2.5 2.5a1.5 1.5 0 010 2.12l-1.5 1.5M16 4h4" />
            </svg>
            <span>{car.fuelType}</span>
          </div>

          {/* Transmission */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary">
            <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1  1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span>{car.transmission}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2.5 text-xs font-semibold text-textSecondary">
            <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <circle cx="12" cy="11" r="3" />
            </svg>
            <span>{getCarLocation()}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-1.5" />

        {/* Footer (Post Date + Details Button) */}
        {/* Footer (Post Date + Actions) */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-11px font-medium text-textSecondary shrink-0">
            {displayDate}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Compare pill — only for real listings */}
            {isRealListing && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCompare(car);
                }}
                disabled={compareFull}
                title={alreadyComparing ? 'In comparison' : compareFull ? 'Comparison full — remove a car first' : 'Add to comparison'}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all select-none cursor-pointer focus:outline-none ${
                  alreadyComparing
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : compareFull
                      ? 'bg-muted/40 text-textSecondary/40 border-border/40 cursor-not-allowed'
                      : 'bg-transparent text-textSecondary border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {alreadyComparing ? (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                )}
                <span>{alreadyComparing ? 'Added' : 'Compare'}</span>
              </button>
            )}
            <Button
              variant="primary"
              size="sm"
              className="font-bold border-none shadow-sm shrink-0"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
