import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import FairPriceBadge from '../components/FairPriceBadge';
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
      const res = await api.post('/bookings', {
        listingId: id,
        message: messageText.trim(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString()
      });
      const threadId = res.data._id;
      navigate(`/bookings/${threadId}`);
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

  const getSellerId = (owner) => {
    if (!owner) return '';
    if (typeof owner === 'object') return owner._id || '';
    return owner;
  };

  const sellerId = getSellerId(listing.owner);
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

  const getGalleryImages = () => {
    if (!listing.images || !Array.isArray(listing.images) || listing.images.length === 0) {
      return [];
    }
    return listing.images
      .filter(img => typeof img === 'string' && img.trim() !== '')
      .map(img => img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000/${img}`);
  };

  const galleryImages = getGalleryImages();

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

            {/* 4. Rental Info Box */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 select-none">
                <span className="text-xs font-semibold text-textSecondary/80 uppercase tracking-wider">Rental Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Price/Day</span>
                  <span className="text-xl font-bold text-primary">${listing.pricePerDay || 'N/A'}</span>
                </div>
                {listing.availableFrom && (
                  <div>
                    <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Available From</span>
                    <span className="text-sm font-semibold text-textPrimary">{new Date(listing.availableFrom).toLocaleDateString()}</span>
                  </div>
                )}
                {listing.availableTo && (
                  <div>
                    <span className="block text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1">Available To</span>
                    <span className="text-sm font-semibold text-textPrimary">{new Date(listing.availableTo).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Vehicle Description */}
            {listing.description && (
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-textPrimary mb-3">About this rental</h3>
                <p className="text-textSecondary text-sm leading-relaxed m-0">{listing.description}</p>
              </div>
            )}

          </div>

          {/* Right Column (4 cols): Sticky price card & Owner Profile card with Contact/Book inside */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            
            {/* 1. Price Per Day Card */}
            <div className="bg-surface border border-border rounded-card-lg p-6 shadow-sm text-left space-y-3">
              <span className="block text-xs font-semibold text-textSecondary select-none">
                Price/day
              </span>
              <div className="font-heading text-4xl font-bold text-textPrimary leading-none select-none">
                ${listing.pricePerDay || 'N/A'}/day
              </div>

              {/* Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <FairPriceBadge pricePerDay={listing.pricePerDay} />
              </div>
            </div>

            {/* 2. Owner Profile Card + Integrated Book/Contact */}
            <div className="bg-surface border border-border rounded-card-lg p-6 shadow-sm text-left space-y-5">
              {/* Profile Header Row */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-base select-none uppercase shadow-sm">
                    {(listing.owner?.name || 'O').split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-textPrimary m-0 leading-tight">
                      {listing.owner?.name || 'N/A'}
                    </h3>
                    <span className="text-xs text-textSecondary font-medium block mt-0.5 select-none">
                      Verified owner
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

              {/* Dynamic 2 Stats Boxes Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bgLight border border-border/60 rounded-2xl p-3 text-center">
                  <div className="font-heading text-xl font-bold text-textPrimary">
                    {listing.owner?.listedCount !== undefined && listing.owner?.listedCount !== null ? listing.owner.listedCount : 'N/A'}
                  </div>
                  <div className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">LISTED</div>
                </div>
                <div className="bg-bgLight border border-border/60 rounded-2xl p-3 text-center">
                  <div className="font-heading text-xl font-bold text-textPrimary">
                    {listing.owner?.rentedCount !== undefined && listing.owner?.rentedCount !== null ? listing.owner.rentedCount : 'N/A'}
                  </div>
                  <div className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mt-0.5">RENTED</div>
                </div>
              </div>

              {/* Contact/Book Functionality inside Profile Box */}
              <div className="pt-2">
                {!user ? (
                  <Button 
                    onClick={() => showAuthModal('login', () => setShowContactForm(true), {
                      title: 'Book this Car',
                      description: 'Log in or sign up to send a booking request to the owner.'
                    })}
                    variant="primary" 
                    size="md" 
                    fullWidth 
                    className="font-bold"
                  >
                    Login to Book
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
                        Book Now
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
