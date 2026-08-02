import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import FairPriceBadge from './FairPriceBadge';
import TrustBadge from './TrustBadge';
import WishlistButton from './WishlistButton';
import CompareButton from './CompareButton';

// Inline SVG Icons
const SparklesIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
  </svg>
);

const BadgeCheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const GaugeIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FuelIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const CalendarIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const MapPinIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// Price Formatter Utility
const formatPrice = (amount) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'N/A';
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

const CarCard = ({ car }) => {
  const targetId = car.id || car._id;
  const isRealListing = Boolean(car._id);

  // Handle image URL
  let imageUrl = null;
  if (car.image) {
    imageUrl = car.image;
  } else if (car.images && car.images.length > 0) {
    const rawImage = car.images[0];
    if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
      imageUrl = rawImage;
    } else {
      imageUrl = `http://localhost:5000/${rawImage}`;
    }
  }

  // Header Title & Specs
  const title = car.title || `${car.brand || ''} ${car.model || ''}`.trim() || 'N/A';
  const yearText = car.year || 'N/A';
  const bodyTypeText = car.bodyType || 'N/A';

  // Price formatting
  let formattedPrice = 'N/A';
  if (car.price !== undefined && car.price !== null) {
    formattedPrice = formatPrice(car.price);
  } else if (car.priceMinText) {
    formattedPrice = car.priceMinText;
  }

  // Fair price logic
  let fairPriceValue = null;
  if (car.fairPrice !== undefined && car.fairPrice !== null) {
    fairPriceValue = car.fairPrice;
  } else if (car.predictedPriceMin && car.predictedPriceMax) {
    fairPriceValue = (car.predictedPriceMin + car.predictedPriceMax) / 2;
  } else if (car.predictedPrice) {
    fairPriceValue = car.predictedPrice;
  }

  let formattedFairPrice = 'N/A';
  let delta = null;
  let priceVerdict = null;

  if (fairPriceValue !== null) {
    formattedFairPrice = formatPrice(fairPriceValue);
    if (car.price) {
      delta = Math.round(((car.price - fairPriceValue) / fairPriceValue) * 100);
      priceVerdict = delta < -3 ? 'under' : delta > 3 ? 'over' : 'fair';
    }
  }

  // Specs grid items
  const mileageText = car.kmDriven !== undefined && car.kmDriven !== null 
    ? `${car.kmDriven.toLocaleString('en-IN')} km` 
    : car.mileage || 'N/A';
  
  const fuelText = car.fuelType || car.fuel || 'N/A';
  const transmissionText = car.transmission || 'N/A';
  const locationText = car.location || car.city || 'N/A';

  // Seller verification status
  const isSellerVerified = Boolean(car.sellerVerified || car.seller?.isVerified);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {/* Media Zone */}
      <Link 
        to={`/listings/${targetId}`} 
        className="relative block aspect-[16/10] overflow-hidden bg-background group"
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <svg viewBox="0 0 120 60" className="h-3/4 w-3/4 text-primary/40" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M10 45 L25 25 L60 22 L95 25 L110 45 Z" strokeLinejoin="round" />
              <circle cx="35" cy="45" r="7" fill="currentColor" opacity="0.15" />
              <circle cx="85" cy="45" r="7" fill="currentColor" opacity="0.15" />
            </svg>
          </div>
        )}

        {/* Bottom subtle gradient for image visual depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Top-left Chips */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-surface/90 px-2.5 py-0.5 text-[11px] font-bold text-textPrimary shadow-xs backdrop-blur-md">
            <SparklesIcon className="w-3 h-3 text-amber-500" />
            AI Evaluated
          </span>
          {isSellerVerified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-surface/90 px-2 py-0.5 text-[11px] font-bold text-primary shadow-xs backdrop-blur-md">
              <BadgeCheckIcon className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Photo count indicator (Bottom-Left) */}
        {car.images && car.images.length > 1 && (
          <div className="absolute left-3 bottom-3 z-10 bg-black/60 backdrop-blur-md text-[10px] font-bold text-white px-2 py-0.5 rounded-md flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            {car.images.length} Photos
          </div>
        )}

        {/* Reusable Wishlist Button (Top-Right) */}
        <WishlistButton listingId={targetId} variant="icon" className="absolute right-3 top-3 z-10" />
      </Link>

      {/* Body Zone */}
      <div className="flex flex-1 flex-col gap-3 p-4 text-left">
        {/* Header Details */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-textSecondary">
              {yearText} · {bodyTypeText}
            </p>
            <Link
              to={`/listings/${targetId}`}
              className="mt-0.5 block truncate text-lg font-semibold text-textPrimary hover:text-primary transition-colors"
            >
              {title}
            </Link>
          </div>
        </div>

        {/* Price + Valuation Cluster */}
        <div className="rounded-xl border border-border/70 bg-bgLight p-3.5 space-y-2.5">
          {/* Top Row: Asking Price (Left Column) + Trust Badge (Right) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary select-none">
                Asking Price
              </span>
              <span className="font-heading text-2xl font-extrabold text-textPrimary leading-tight mt-0.5">
                {formattedPrice}
              </span>
            </div>

            <TrustBadge score={car.trustScore} />
          </div>

          {/* AI Fair Price Range Banner */}
          {car.predictedPriceMin && car.predictedPriceMax ? (
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg select-none">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Fair Range:</span>
              <span className="font-bold">{formatPrice(car.predictedPriceMin)} – {formatPrice(car.predictedPriceMax)}</span>
            </div>
          ) : (
            <div className="text-[11px] font-medium text-textSecondary/80">
              Fair Est: {formattedFairPrice}
            </div>
          )}

          {/* Bottom Row: Market Verdict Badge & Risk Flag */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <FairPriceBadge verdict={priceVerdict} delta={delta} />
            {car.riskFlag && car.riskFlag !== 'Low' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dangerLight text-danger border border-dangerBorder/50 uppercase select-none">
                {car.riskFlag} Risk
              </span>
            )}
          </div>
        </div>

        {/* 2x2 Specs Grid */}
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-textSecondary m-0">
          <div className="flex items-center gap-1.5">
            <GaugeIcon className="w-3.5 h-3.5 text-textSecondary/80" />
            <span>{mileageText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FuelIcon className="w-3.5 h-3.5 text-textSecondary/80" />
            <span>{fuelText}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-textSecondary/80" />
            <span>{transmissionText}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPinIcon className="w-3.5 h-3.5 text-textSecondary/80" />
            <span className="truncate">{locationText}</span>
          </div>
        </dl>

        {/* Actions Footer */}
        <div className="mt-auto flex items-center gap-2 pt-1">
          <Link to={`/listings/${targetId}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              View details
            </Button>
          </Link>
          
          {isRealListing && (
            <CompareButton listing={car} variant="card" />
          )}
        </div>
      </div>
    </article>
  );
};

export default CarCard;

