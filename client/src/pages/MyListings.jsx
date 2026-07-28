import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import Badge from '../components/Badge';

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyListings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/listings/mine');
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      setError(err.response?.data?.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    fetchMyListings();
  }, [user, authLoading]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    
    try {
      await api.delete(`/listings/${id}`);
      setListings(prev => prev.filter(listing => listing._id !== id));
      alert('Listing deleted successfully.');
    } catch (err) {
      console.error('Error deleting listing:', err);
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Auth Protection Guard
  if (authLoading) {
    return (
      <div className="w-full bg-background min-h-screen py-16 flex flex-col items-center justify-center font-sans text-textPrimary">
        <div className="w-10 h-10 border-4 border-border border-t-secondary rounded-full animate-spin mb-4" />
        <p className="text-textSecondary text-xs font-bold m-0">Verifying authorization status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full bg-background min-h-screen py-16 flex flex-col items-center justify-center font-sans text-textPrimary">
        <div className="max-w-md w-full bg-surface border border-border rounded-card-lg p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-dangerLight border border-dangerBorder/30 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-textPrimary mb-2">Access Denied</h2>
          <p className="text-textSecondary text-sm font-medium leading-relaxed mb-6">
            You are not authorized to view this page. Please log in to access your listings dashboard.
          </p>
          <Link to="/" className="no-underline">
            <Button variant="primary" size="md" className="font-bold">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-background min-h-screen py-16 flex flex-col items-center justify-center font-sans text-textPrimary">
        <div className="w-10 h-10 border-4 border-border border-t-secondary rounded-full animate-spin mb-4" />
        <p className="text-textSecondary text-xs font-bold m-0">Loading your listings...</p>
      </div>
    );
  }

  // Calculate Stat Counts
  const activeCount = listings.filter(l => l.status === 'active').length;
  const pendingCount = listings.filter(l => l.status === 'pending_review').length;
  const rejectedCount = listings.filter(l => l.status === 'rejected').length;

  // Image path resolver helper
  const getImageUrl = (listingItem) => {
    if (listingItem.image) return listingItem.image;
    if (listingItem.images && listingItem.images.length > 0) {
      const rawImage = listingItem.images[0];
      if (rawImage.startsWith('http') || rawImage.startsWith('data:')) {
        return rawImage;
      }
      return `http://localhost:5000/${rawImage}`;
    }
    return null;
  };

  const formatPrice = (p) => {
    return `₹${p.toLocaleString('en-IN')}`;
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending_review':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'sold':
        return 'secondary';
      default:
        return 'muted';
    }
  };

  const formatStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending_review':
        return 'Pending review';
      case 'rejected':
        return 'Rejected';
      case 'sold':
        return 'Sold';
      default:
        return status;
    }
  };

  return (
    <div className="w-full bg-background min-h-screen py-12 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-row items-center justify-between select-none">
          <div>
            <h1 className="text-h1 m-0">
              My listings
            </h1>
            <p className="text-body text-sm m-0 mt-1 select-none leading-relaxed text-textSecondary">
              Manage your listings and track their review status.
            </p>
          </div>
          <span className="text-xs font-semibold text-textSecondary select-none">
            {listings.length} vehicle{listings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div className="w-full bg-dangerLight border border-dangerBorder text-danger text-xs font-bold rounded-2xl p-4 shadow-sm select-none text-left">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="w-full py-24 text-center bg-surface border border-border rounded-card-lg p-8 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6 border border-border">
              <svg className="w-8 h-8 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-card-title mb-2 m-0">No listings found</h3>
            <p className="text-body text-sm leading-relaxed max-w-[340px] mx-auto m-0 mb-6 text-textSecondary">
              You haven't created any vehicle listings yet. Start selling today!
            </p>
            <Link to="/create-listing">
              <Button variant="primary" size="md" className="font-bold border-none shadow-sm text-xs">
                List My Car
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stat Cards Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
              {/* Active */}
              <div className="bg-surface border border-border rounded-card-lg p-6 space-y-2.5 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <span className="block text-[11px] font-bold tracking-wider text-textSecondary uppercase">
                  Active
                </span>
                <span className="block text-4xl font-bold text-primary">
                  {activeCount}
                </span>
              </div>
              {/* Pending */}
              <div className="bg-surface border border-border rounded-card-lg p-6 space-y-2.5 shadow-sm hover:shadow-md hover:border-warning/20 transition-all duration-300">
                <span className="block text-[11px] font-bold tracking-wider text-textSecondary uppercase">
                  Pending review
                </span>
                <span className="block text-4xl font-bold text-warning">
                  {pendingCount}
                </span>
              </div>
              {/* Rejected */}
              <div className="bg-surface border border-border rounded-card-lg p-6 space-y-2.5 shadow-sm hover:shadow-md hover:border-danger/20 transition-all duration-300">
                <span className="block text-[11px] font-bold tracking-wider text-textSecondary uppercase">
                  Rejected
                </span>
                <span className="block text-4xl font-bold text-danger">
                  {rejectedCount}
                </span>
              </div>
            </div>

            {/* Listings Table Card */}
            <div className="bg-surface border border-border rounded-card-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border select-none text-left bg-surface/50">
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase">Vehicle</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase">Brand</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase">Model</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase">Year</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase">Price</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase">Status / Insights</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-wider text-textSecondary uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {listings.map((listingItem) => {
                      const image = getImageUrl(listingItem);
                      
                      return (
                        <tr key={listingItem._id} className="hover:bg-background/40 transition-colors">
                          {/* Vehicle Thumbnail & Name */}
                          <td className="py-4 px-6 flex items-center gap-4 min-w-[240px]">
                            <div className="w-12 h-9 rounded-lg overflow-hidden border border-border/60 bg-background flex-shrink-0 flex items-center justify-center">
                              {image ? (
                                <img
                                  src={image}
                                  alt={`${listingItem.brand} ${listingItem.model}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-4 h-4 text-textSecondary/40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
                                </svg>
                              )}
                            </div>
                            <div className="text-left leading-normal">
                              <span className="font-bold text-textPrimary block text-sm">
                                {listingItem.brand} {listingItem.model} {listingItem.year}
                              </span>
                              {listingItem.status === 'rejected' && listingItem.rejectionReason && (
                                <span className="text-[10px] font-bold text-danger block mt-0.5">
                                  Reason: {listingItem.rejectionReason}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Brand */}
                          <td className="py-4 px-6 text-sm font-semibold text-textSecondary">
                            {listingItem.brand}
                          </td>

                          {/* Model */}
                          <td className="py-4 px-6 text-sm font-semibold text-textSecondary">
                            {listingItem.model}
                          </td>

                          {/* Year */}
                          <td className="py-4 px-6 text-sm font-semibold text-textSecondary">
                            {listingItem.year}
                          </td>

                          {/* Price */}
                          <td className="py-4 px-6 text-sm font-bold text-textPrimary">
                            {formatPrice(listingItem.price)}
                          </td>
                          
                          {/* Status / Insights */}
                          <td className="py-4 px-6">
                            <Badge variant={getBadgeVariant(listingItem.status)} className="py-1 select-none font-bold">
                              {formatStatusText(listingItem.status)}
                            </Badge>
                          </td>

                          {/* Actions formatted as Outline Badges */}
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap select-none">
                            <Link
                              to={`/listings/${listingItem._id}`}
                              className="inline-flex items-center px-2.5 py-1 rounded bg-secondary/10 hover:bg-secondary/20 text-secondary hover:text-secondaryHover text-xs font-bold no-underline transition-all shadow-sm"
                            >
                              View
                            </Link>
                            <Link
                              to={`/edit-listing/${listingItem._id}`}
                              className="inline-flex items-center px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary hover:text-primaryHover text-xs font-bold no-underline transition-all shadow-sm"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(listingItem._id)}
                              className="inline-flex items-center px-2.5 py-1 rounded bg-danger/10 hover:bg-danger/20 text-danger hover:text-dangerHover text-xs font-bold no-underline transition-all shadow-sm cursor-pointer border-none"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex justify-end pt-4 select-none">
              <Link to="/create-listing">
                <Button variant="primary" size="md" className="font-bold border-none shadow-sm text-xs">
                  List a new car
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;
