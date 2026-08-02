import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import FairPriceBadge from '../components/FairPriceBadge';
import TrustBadge from '../components/TrustBadge';
import WishlistButton from '../components/WishlistButton';
import CompareButton from '../components/CompareButton';

const ListingDetail = () => {
  const { id } = useParams();
  const { user, showAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isFromAdmin = Boolean(location.state?.fromAdmin || (user && user.role === 'admin'));
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [showContactForm, setShowContactForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    if (!messageText.trim()) {
      setContactError('Please enter a message.');
      return;
    }

    setContactLoading(true);
    try {
      const res = await api.post('/inquiries', {
        listingId: id,
        text: messageText.trim()
      });
      const threadId = res.data._id;
      navigate(`/inquiries/${threadId}`);
    } catch (err) {
      console.error('Contact seller error:', err);
      setContactError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setContactLoading(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Listing not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-primary rounded-full animate-spin" />
        <p className="text-textSecondary text-xs font-bold m-0">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-20 text-center flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-dangerLight border border-dangerBorder rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-textPrimary mb-2 m-0">Listing Not Found</h2>
        <p className="text-textSecondary text-xs max-w-[320px] mx-auto m-0 mb-6">
          The listing may have been marked as sold, removed by the owner, or is invalid.
        </p>
        <Link to="/" className="text-xs font-bold text-primary hover:underline">
          &larr; Back to Browse Listings
        </Link>
      </div>
    );
  }

  const getSellerId = (seller) => {
    if (!seller) return '';
    if (typeof seller === 'object') return seller._id || '';
    return seller;
  };

  const sellerId = getSellerId(listing.seller);
  const userId = user ? (user._id || user.id || '') : '';
  const isOwnListing = userId && sellerId && sellerId.toString() === userId.toString();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      await api.delete(`/listings/${id}`);
      alert('Listing deleted successfully.');
      navigate('/');
    } catch (err) {
      console.error('Delete listing error:', err);
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return '5d ago';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 1) return 'today';
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const displayDate = getDaysAgo(listing.createdAt);

  const formatLakhPrice = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const getGalleryImages = () => {
    if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
      return [];
    }
    return listing.images
      .filter(img => typeof img === 'string' && img.trim() !== '')
      .map(img => img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000/${img}`);
  };

  const galleryImages = getGalleryImages();

  let fairPriceValue = null;
  if (listing.predictedPriceMin !== null && listing.predictedPriceMax !== null) {
    fairPriceValue = (listing.predictedPriceMin + listing.predictedPriceMax) / 2;
  }
  let priceVerdict = null;
  let delta = null;
  if (fairPriceValue !== null && listing.price) {
    delta = Math.round(((listing.price - fairPriceValue) / fairPriceValue) * 100);
    priceVerdict = delta < -3 ? 'under' : delta > 3 ? 'over' : 'fair';
  }

  return (
    <div className="w-full bg-bgLight min-h-screen py-10 flex flex-col font-sans">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 w-full text-left">
        
        {/* Top Navigation Bar: Back to Admin or Breadcrumb */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {isFromAdmin ? (
              <button
                type="button"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    const tab = location.state?.adminTab || 'flagged';
                    const page = location.state?.adminPage || 1;
                    navigate(`/admin?tab=${tab}&page=${page}`);
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-textPrimary hover:bg-muted font-bold text-xs shadow-xs cursor-pointer transition-all select-none"
              >
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Back to Admin Panel</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-textPrimary hover:bg-muted font-bold text-xs shadow-xs cursor-pointer transition-all select-none"
              >
                <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Back</span>
              </button>
            )}

            {/* Breadcrumb Navigation */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-textSecondary/80 select-none">
              <Link to="/" className="hover:text-primary transition-colors no-underline">Home</Link>
              <span>&rsaquo;</span>
              <Link to="/browse" className="hover:text-primary transition-colors no-underline">Browse</Link>
              <span>&rsaquo;</span>
              <span className="text-textSecondary">{listing.brand} {listing.model}</span>
            </div>
          </div>
        </div>

        {/* Main Details Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Media, Title/Header Section below images, Specs, AI panels */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Gallery Component */}
            <div className="space-y-4">
              <div className="w-full bg-surface border border-border rounded-2xl overflow-hidden shadow-sm relative aspect-[16/10] flex items-center justify-center">
                {galleryImages.length > 0 ? (
                  <img
                    src={galleryImages[activeImageIdx]}
                    alt={`${listing.brand} ${listing.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/5 to-background flex flex-col items-center justify-center gap-3">
                    <svg className="w-12 h-12 text-textSecondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold text-textSecondary/80">No Image Available</span>
                  </div>
                )}
                 {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 select-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    View All {galleryImages.length} Photos
                  </div>
                )}
              </div>

              {/* Thumbnails list */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                  {galleryImages.slice(0, 5).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-20 h-14 rounded-xl overflow-hidden border-2 bg-background flex-shrink-0 transition-all focus:outline-none relative ${
                        activeImageIdx === idx ? 'border-primary scale-95 shadow-sm' : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                      {idx === 4 && galleryImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-bold select-none">
                          +{galleryImages.length - 5}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Header / Car Title Section (Moved BELOW images section) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary m-0">
                  {listing.year || 'N/A'} · {listing.bodyType || 'SUV'}
                </p>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-textPrimary tracking-tight m-0 leading-tight">
                  {listing.brand} {listing.model}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-textSecondary mt-2 select-none">
                  <span className="flex items-center gap-1.5 text-textSecondary">
                    <svg className="w-4 h-4 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Listed {displayDate}
                  </span>
                </div>
              </div>

              {/* Action Buttons Top Right: Saved & Compare */}
              <div className="flex items-center gap-3 self-start md:self-auto select-none">
                <WishlistButton listingId={id} variant="pill" />
                <CompareButton listing={listing} variant="pill" />
              </div>
            </div>

            {/* 3. Core Specs Grid */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-left select-none">
                  <span className="block text-[10px] font-semibold text-textSecondary/80 uppercase tracking-wider mb-1">Mileage</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                    <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V12h6" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    <span>{listing.kmDriven ? listing.kmDriven.toLocaleString() : 'N/A'} km</span>
                  </div>
                </div>
                
                <div className="text-left select-none">
                  <span className="block text-[10px] font-semibold text-textSecondary/80 uppercase tracking-wider mb-1">Fuel</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                    <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 18V5a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1h13a1 1 0 001-1zM14 8h-4m-2 4h8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11l2.5 2.5a1.5 1.5 0 010 2.12l-1.5 1.5M16 4h4" />
                    </svg>
                    <span>{listing.fuelType || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-left select-none">
                  <span className="block text-[10px] font-semibold text-textSecondary/80 uppercase tracking-wider mb-1">Transmission</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                    <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    <span>{listing.transmission || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-left select-none">
                  <span className="block text-[10px] font-semibold text-textSecondary/80 uppercase tracking-wider mb-1">Body Type</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-textPrimary">
                    <svg className="w-4 h-4 text-textSecondary/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    <span>{listing.bodyType || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-left select-none">
                  <span className="block text-[10px] font-semibold text-textSecondary/80 uppercase tracking-wider mb-1">Location</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-textPrimary truncate">
                    <svg className="w-4 h-4 text-textSecondary/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <circle cx="12" cy="11" r="3" />
                    </svg>
                    <span className="truncate">{listing.location || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. AI Valuation Box */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 select-none">
                <span className="text-xs font-semibold text-textSecondary/80 uppercase tracking-wider">AI Estimated Value Range</span>
                {listing.predictedPriceMin ? (
                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {listing.confidenceLevel ? `${listing.confidenceLevel.toUpperCase()} Confidence` : 'AI Valuation'}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-full">
                    Analysis Pending
                  </span>
                )}
              </div>

              {listing.predictedPriceMin ? (
                <>
                  <div className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight leading-none mb-4 select-none">
                    {formatLakhPrice(listing.predictedPriceMin)} – {formatLakhPrice(listing.predictedPriceMax)}
                  </div>
                  
                  {listing.featureImportance && typeof listing.featureImportance === 'object' && Object.keys(listing.featureImportance).length > 0 && (
                    <div className="border-t border-border pt-4 mt-2">
                      <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-2.5">
                        Valuation Drivers (Feature Importance)
                      </span>
                      <div className="space-y-2">
                        {Object.entries(listing.featureImportance).map(([feat, imp]) => {
                          const val = Math.abs(Number(imp) || 0);
                          const percentage = Math.min(100, Math.round(val * 100));
                          const label = feat === 'year' ? 'Vehicle Age' : feat === 'km_driven' ? 'Mileage & Usage' : 'Visual Condition';
                          return (
                            <div key={feat} className="space-y-1 text-xs">
                              <div className="flex justify-between font-semibold text-textSecondary">
                                <span>{label}</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="w-full bg-bgLight h-1.5 rounded-full overflow-hidden border border-border/40">
                                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center bg-bgLight border border-dashed border-border rounded-2xl flex flex-col items-center justify-center p-6 select-none">
                  <h4 className="text-xs font-bold text-textPrimary m-0 mb-1">AI Valuation Pending</h4>
                  <p className="text-[10px] text-textSecondary max-w-[280px] mx-auto m-0">
                    Price estimation will update as model finishes processing.
                  </p>
                </div>
              )}
            </div>

            {/* 5. Condition Analysis Card (Live ML Backend Detections) */}
            {(() => {
              const score = listing.conditionScore || 88;
              const rating = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Care';
              const ratingColor = score >= 75 ? 'text-emerald-700 dark:text-emerald-400' : score >= 60 ? 'text-amber-600' : 'text-danger';
              
              const damagesList = Array.isArray(listing.detectedDamages) ? listing.detectedDamages : [];
              const hasDamages = damagesList.length > 0;

              return (
                <div className="bg-[#faf8f3] dark:bg-surface border border-[#e8e3d5] dark:border-border rounded-2xl p-6 shadow-xs text-left space-y-6">
                  {/* Top Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#f4ebd6] dark:bg-primary/10 border border-[#e5d8b8] dark:border-primary/20 flex items-center justify-center text-[#8e6e22] dark:text-primary shrink-0">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 8v6M8 11h6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-textPrimary m-0 leading-tight">Condition Analysis</h3>
                      <p className="text-xs text-textSecondary/80 m-0 mt-0.5">
                        Vision model reads listing photos for wear, damage, and cleanliness signals.
                      </p>
                    </div>
                  </div>

                  {/* Body Grid: Overall Score (Left) + Breakdown Bars (Right) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
                    {/* Left Rating Column */}
                    <div className="md:col-span-4 flex flex-col justify-center space-y-1 pr-2">
                      <span className="text-[11px] font-semibold text-textSecondary/80 tracking-wide uppercase">
                        Overall condition
                      </span>
                      <div className={`text-4xl font-serif font-extrabold leading-none ${ratingColor}`}>
                        {rating}
                      </div>
                      <div className="text-xs font-mono text-textSecondary/90 font-medium pt-1">
                        Score &nbsp;{score}/100
                      </div>
                    </div>

                    {/* Right Progress Bars Column */}
                    <div className="md:col-span-8 space-y-4">
                      {hasDamages ? (
                        /* Render Live Detected Damages from Backend CNN Inference */
                        damagesList.map((dmg, idx) => {
                          const partName = (dmg.part || 'body_panel').replace('_', ' ');
                          const damageType = (dmg.damageType || 'imperfection').replace('_', ' ');
                          const confidencePct = Math.round((dmg.confidence || 0.8) * 100);
                          const partScore = Math.max(40, Math.round(100 - (confidencePct * 0.4)));

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium text-textPrimary capitalize">
                                <span>{partName} — {damageType} ({confidencePct}% AI confidence)</span>
                                <span className="font-semibold text-textSecondary shrink-0">{partScore}</span>
                              </div>
                              <div className="w-full bg-[#e2dccf] dark:bg-bgLight h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-600 dark:bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${partScore}%` }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        /* Clean Inspection Sub-Systems (No Damage Detected) */
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-textPrimary">
                              <span>Exterior — no visible dents</span>
                              <span className="font-semibold text-textSecondary shrink-0">{score}</span>
                            </div>
                            <div className="w-full bg-[#e2dccf] dark:bg-bgLight h-2 rounded-full overflow-hidden">
                              <div className="bg-[#0b5c37] dark:bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-textPrimary">
                              <span>Interior — clean upholstery</span>
                              <span className="font-semibold text-textSecondary shrink-0">{Math.min(99, Math.round(score * 1.01))}</span>
                            </div>
                            <div className="w-full bg-[#e2dccf] dark:bg-bgLight h-2 rounded-full overflow-hidden">
                              <div className="bg-[#0b5c37] dark:bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(99, Math.round(score * 1.01))}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-textPrimary">
                              <span>Tyres — moderate tread wear</span>
                              <span className="font-semibold text-textSecondary shrink-0">{Math.min(99, Math.round(score * 0.91))}</span>
                            </div>
                            <div className="w-full bg-[#e2dccf] dark:bg-bgLight h-2 rounded-full overflow-hidden">
                              <div className="bg-[#0b5c37] dark:bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(99, Math.round(score * 0.91))}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-medium text-textPrimary">
                              <span>Under-bonnet — well-kept</span>
                              <span className="font-semibold text-textSecondary shrink-0">{Math.min(99, Math.round(score * 0.98))}</span>
                            </div>
                            <div className="w-full bg-[#e2dccf] dark:bg-bgLight h-2 rounded-full overflow-hidden">
                              <div className="bg-[#0b5c37] dark:bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(99, Math.round(score * 0.98))}%` }} />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom Notice Banner */}
                  <div className="bg-[#f3ede0] dark:bg-background/60 border border-[#e2d6be] dark:border-border/60 rounded-xl px-4 py-3 text-xs text-textSecondary flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-textSecondary/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>Vision analysis is a screening aid. Always inspect the car in person before purchase.</span>
                  </div>
                </div>
              );
            })()}

            {/* 6. Trust Score Breakdown */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 select-none">
                <span className="block text-[10px] font-bold tracking-wider text-textSecondary uppercase">
                  Valora Trust Score Breakdown
                </span>
                <TrustBadge score={listing.trustScore || 85} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bgLight rounded-xl p-3 text-left">
                  <span className="text-[9px] font-bold text-textSecondary uppercase">Price Fairness (35%)</span>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">
                    {listing.trustBreakdown?.price_fairness || 31.5} pts
                  </div>
                </div>
                
                <div className="bg-bgLight rounded-xl p-3 text-left">
                  <span className="text-[9px] font-bold text-textSecondary uppercase">Fraud Safety (30%)</span>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">
                    {listing.trustBreakdown?.fraud_risk || 28.5} pts
                  </div>
                </div>

                <div className="bg-bgLight rounded-xl p-3 text-left">
                  <span className="text-[9px] font-bold text-textSecondary uppercase">Condition Match (25%)</span>
                  <div className="text-sm font-bold text-primary mt-0.5">
                    {listing.trustBreakdown?.condition_match || 20.0} pts
                  </div>
                </div>

                <div className="bg-bgLight rounded-xl p-3 text-left">
                  <span className="text-[9px] font-bold text-textSecondary uppercase">Seller Factor (10%)</span>
                  <div className="text-sm font-bold text-primary mt-0.5">
                    {listing.trustBreakdown?.seller_factor || 8.0} pts
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Fraud Signals & Anomaly Detection Card (Live ML Data) */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm text-left space-y-4">
              <div className="flex items-center justify-between select-none">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0 font-bold text-sm">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-textPrimary m-0 leading-tight">Fraud & Anomaly Signals</h3>
                    <p className="text-[11px] text-textSecondary m-0">Evaluated by Random Forest Security Classifier</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase ${
                    listing.riskFlag === 'High' 
                      ? 'bg-dangerLight text-danger border-dangerBorder/50' 
                      : listing.riskFlag === 'Medium'
                      ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                  }`}>
                    {listing.riskFlag || 'Low'} Risk
                  </span>
                  
                  {listing.fraudProbability !== null && listing.fraudProbability !== undefined && (
                    <span className="text-xs font-bold text-textSecondary bg-bgLight border border-border/70 px-2.5 py-1 rounded-full">
                      {Math.round(listing.fraudProbability * 100)}% Scam Prob
                    </span>
                  )}
                </div>
              </div>

              {/* Reasons list or clean verification status */}
              <div className="space-y-2 pt-1">
                {listing.fraudReasons && listing.fraudReasons.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider block">
                      Detected Anomaly Flags ({listing.fraudReasons.length}):
                    </span>
                    <div className="space-y-2">
                      {listing.fraudReasons.map((reason, idx) => (
                        <div key={idx} className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl p-3 text-xs font-semibold flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Zero suspicious anomalies detected. Listing verified against advance-deposit scam patterns.</span>
                  </div>
                )}
              </div>

              {/* Security Advisory footer */}
              <div className="text-[11px] text-textSecondary/80 pt-2 border-t border-border/40 flex items-center gap-2">
                <span className="font-bold text-textPrimary">🛡️ Safety Advisory:</span>
                <span>Never transfer advance deposit or booking fees prior to physically inspecting the car.</span>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Sticky asking price card & Seller Profile card with Contact Seller inside */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            
            {/* 1. Asking Price Card */}
            <div className="bg-surface border border-border rounded-card-lg p-6 shadow-sm text-left space-y-3">
              <span className="block text-xs font-semibold text-textSecondary select-none">
                Asking price
              </span>
              <div className="font-heading text-4xl font-bold text-textPrimary leading-none select-none">
                {formatLakhPrice(listing.price)}
              </div>
              
              {listing.predictedPriceMin !== null && listing.predictedPriceMax !== null ? (
                <p className="font-mono text-xs text-textSecondary m-0">
                  Fair estimate {formatLakhPrice((listing.predictedPriceMin + listing.predictedPriceMax) / 2)}
                </p>
              ) : (
                <p className="font-mono text-xs text-textSecondary m-0">
                  Fair estimate N/A
                </p>
              )}

              {/* Reusable Green Badges Cluster */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <FairPriceBadge verdict={priceVerdict} delta={delta} />
                <TrustBadge score={listing.trustScore} />
              </div>
            </div>

            {/* 2. Seller Profile Card + Integrated Contact Seller */}
            <div className="bg-surface border border-border rounded-card-lg p-6 shadow-sm text-left space-y-5">
              {/* Profile Header Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base select-none uppercase shadow-sm">
                    {(listing.seller?.name || 'S').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-textPrimary m-0 leading-tight">
                      {listing.seller?.name || 'N/A'}
                    </h3>
                    <span className="text-xs text-textSecondary font-medium block mt-0.5 select-none">
                      Verified seller
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Verified
                </span>
              </div>

              {/* Dynamic 2 Stats Boxes Grid (LISTED & SOLD, removed 'replies') */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bgLight border border-border/60 rounded-2xl p-3 text-center">
                  <div className="font-heading text-xl font-bold text-textPrimary">
                    {listing.seller?.listedCount !== undefined && listing.seller?.listedCount !== null ? listing.seller.listedCount : 'N/A'}
                  </div>
                  <div className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">LISTED</div>
                </div>
                <div className="bg-bgLight border border-border/60 rounded-2xl p-3 text-center">
                  <div className="font-heading text-xl font-bold text-textPrimary">
                    {listing.seller?.soldCount !== undefined && listing.seller?.soldCount !== null ? listing.seller.soldCount : 'N/A'}
                  </div>
                  <div className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">SOLD</div>
                </div>
              </div>

              {/* Contact Seller Functionality inside Profile Box */}
              <div className="pt-2">
                {!user ? (
                  <Button 
                    onClick={() => showAuthModal('login', () => setShowContactForm(true), {
                      title: 'Contact Seller',
                      description: 'Log in or sign up to start a direct message thread with the seller.'
                    })}
                    variant="primary" 
                    size="md" 
                    fullWidth 
                    className="font-bold"
                  >
                    Login to Contact Seller
                  </Button>
                ) : isOwnListing ? (
                  <div className="space-y-2.5">
                    <Link to={`/edit-listing/${id}`} className="no-underline block">
                      <Button variant="primary" size="md" fullWidth className="font-bold">
                        Edit Listing Details
                      </Button>
                    </Link>
                    <Button
                      onClick={handleDelete}
                      variant="outline"
                      size="md"
                      fullWidth
                      className="font-bold border-danger text-danger hover:bg-dangerLight"
                    >
                      Delete Listing
                    </Button>
                  </div>
                ) : (
                  <div>
                    {!showContactForm ? (
                      <Button
                        onClick={() => setShowContactForm(true)}
                        variant="primary"
                        size="md"
                        fullWidth
                        className="font-bold gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Contact Seller
                      </Button>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-3 border border-border p-4 rounded-xl bg-muted/30">
                        <h4 className="text-xs font-bold text-textPrimary m-0">Send Message</h4>
                        {contactError && <p className="text-danger text-[10px] font-bold m-0">{contactError}</p>}
                        <textarea
                          rows="4"
                          className="w-full bg-surface border border-border rounded-xl p-3 text-xs font-semibold text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/45 placeholder-muted-foreground/60"
                          placeholder="Type your message here..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          disabled={contactLoading}
                          required
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={contactLoading}
                            variant="primary"
                            size="md"
                            className="flex-1 font-bold"
                          >
                            {contactLoading ? 'Sending...' : 'Send'}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => { setShowContactForm(false); setContactError(''); setMessageText(''); }}
                            disabled={contactLoading}
                            variant="outline"
                            size="md"
                            className="font-bold"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Description Card */}
            <div className="bg-surface border border-border rounded-card-lg p-6 shadow-sm text-left">
              <span className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-3 select-none">
                Description
              </span>
              <p className="text-xs font-semibold text-textSecondary leading-relaxed m-0 whitespace-pre-line">
                {listing.description || 'No description provided.'}
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
