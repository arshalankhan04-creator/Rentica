import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/Button';
import Badge from '../components/Badge';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'pending'; // 'pending', 'flagged', or 'all'
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [stats, setStats] = useState({
    activeListings: 0,
    totalUsers: 0,
    awaitingReview: 0,
    
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const rejectInputRef = useRef(null);

  const LIMIT = 10;

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '/admin/pending';
      // Flagged tab removed
      if (activeTab === 'all') endpoint = '/admin/listings';

      const res = await api.get(`${endpoint}?page=${page}&limit=${LIMIT}`);
      setListings(res.data || []);
    } catch (err) {
      console.error('Error fetching listings for admin:', err);
      setError(err.response?.data?.message || 'Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || user.role !== 'admin') return;
    fetchStats();
    fetchListings();
  }, [user, authLoading, activeTab, page]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab, page: '1' });
    setRejectingId(null);
  };

  const handleApprove = async (id) => {
    setError('');
    try {
      await api.put(`/admin/listings/${id}/approve`);
      fetchStats();
      
      if (activeTab === 'pending' || activeTab === 'flagged') {
        setListings(prev => prev.filter(item => item._id !== id));
      } else {
        setListings(prev => prev.map(item => item._id === id ? { ...item, status: 'active', rejectionReason: null } : item));
      }
    } catch (err) {
      console.error('Approve listing error:', err);
      setError(err.response?.data?.message || 'Failed to approve listing.');
    }
  };

  const handleStartReject = (id) => {
    setRejectingId(id);
    setRejectReason('');
    setRejectError('');
    setTimeout(() => {
      rejectInputRef.current?.focus();
    }, 50);
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
    setRejectError('');
  };

  const handleConfirmReject = async (id) => {
    setError('');
    setRejectError('');
    if (!rejectReason.trim()) {
      setRejectError('Reason is required');
      setTimeout(() => {
        rejectInputRef.current?.focus();
      }, 0);
      return;
    }

    try {
      await api.put(`/admin/listings/${id}/reject`, { reason: rejectReason.trim() });
      fetchStats();

      if (activeTab === 'pending' || activeTab === 'flagged') {
        setListings(prev => prev.filter(item => item._id !== id));
      } else {
        setListings(prev => prev.map(item => item._id === id ? { ...item, status: 'rejected', rejectionReason: rejectReason.trim() } : item));
      }
      setRejectingId(null);
      setRejectReason('');
      setRejectError('');
    } catch (err) {
      console.error('Reject listing error:', err);
      setError(err.response?.data?.message || 'Failed to reject listing.');
    }
  };

  // Auth Guard check
  if (authLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-muted/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-textSecondary text-xs font-bold m-0">Verifying authorization...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-surface border border-border rounded-2xl shadow-lg text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-dangerLight/60 text-danger border border-dangerBorder flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-textPrimary mb-2">Access Denied</h2>
        <p className="text-textSecondary text-sm mb-6 leading-relaxed">
          You are not authorized to view the Admin Moderation Panel. Administrator privileges are required.
        </p>
        <Link to="/">
          <Button variant="primary" size="sm" className="w-full">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'rented':
        return <Badge variant="primary">Sold</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'pending_review':
        return <Badge variant="warning">Awaiting Review</Badge>;
      default:
        return <Badge variant="muted">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <div className="w-full bg-bgLight min-h-screen py-10 font-sans text-left">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-textPrimary tracking-tight m-0">
                Admin Moderation Panel
              </h1>
              <Badge variant="primary" className="py-1">
                Admin Portal
              </Badge>
            </div>
            <p className="text-xs md:text-sm font-medium text-textSecondary mt-1.5 m-0 max-w-2xl">
              Moderate vehicle listings, review pending listings, and manage vehicle status across Rentica.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center bg-surface border border-border rounded-xl p-1 shadow-xs self-start md:self-auto select-none overflow-x-auto">
            <button
              type="button"
              onClick={() => handleTabChange('pending')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-muted/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Awaiting Review
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('flagged')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'flagged'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-muted/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Flagged Risk
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-none flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-transparent text-textSecondary hover:text-textPrimary hover:bg-muted/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              All Listings
            </button>
          </div>
        </div>

        {/* Top Interactive Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Active Listings */}
          <div
            onClick={() => handleTabChange('all')}
            className={`bg-surface border rounded-2xl p-5 shadow-xs transition-all cursor-pointer select-none hover:shadow-md ${
              activeTab === 'all' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Active Listings</span>
              <div className="w-9 h-9 rounded-xl bg-successLight text-success flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-textPrimary m-0">{stats.activeListings}</p>
              <p className="text-xs text-textSecondary font-semibold mt-1 m-0">Live on marketplace</p>
            </div>
          </div>

          {/* Card 2: Total Users */}
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs select-none">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Users</span>
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-textPrimary m-0">{stats.totalUsers}</p>
              <p className="text-xs text-textSecondary font-semibold mt-1 m-0">Registered accounts</p>
            </div>
          </div>

          {/* Card 3: Awaiting Review */}
          <div
            onClick={() => handleTabChange('pending')}
            className={`bg-surface border rounded-2xl p-5 shadow-xs transition-all cursor-pointer select-none hover:shadow-md ${
              activeTab === 'pending' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Awaiting Review</span>
              <div className="w-9 h-9 rounded-xl bg-warningLight text-warning flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-textPrimary m-0">{stats.awaitingReview}</p>
              <p className="text-xs text-warning font-bold mt-1 m-0">Pending approval queue</p>
            </div>
          </div>

          {/* Card 4: Flagged Risk */}
          <div
            onClick={() => handleTabChange('flagged')}
            className={`bg-surface border rounded-2xl p-5 shadow-xs transition-all cursor-pointer select-none hover:shadow-md ${
              activeTab === 'flagged' ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Flagged Risk</span>
              <div className="w-9 h-9 rounded-xl bg-dangerLight text-danger flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-3xl font-extrabold text-textPrimary m-0">{stats.flaggedRisk}</p>
              <p className="text-xs text-danger font-bold mt-1 m-0">High & medium risk</p>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="w-full bg-dangerLight border border-dangerBorder rounded-xl p-4 text-danger text-xs font-bold flex items-center gap-2 shadow-xs">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Data Table Area */}
        {loading ? (
          <div className="w-full bg-surface border border-border rounded-2xl p-16 flex flex-col items-center justify-center shadow-xs">
            <div className="w-8 h-8 border-3 border-muted/40 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-textSecondary text-xs font-bold m-0">Loading listings data...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="w-full bg-surface border border-border rounded-2xl p-16 text-center shadow-xs flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-textPrimary m-0 mb-1">
              {activeTab === 'flagged' ? 'No listings require review' : 'No listings found'}
            </h3>
            <p className="text-textSecondary text-xs m-0">
              {activeTab === 'flagged' ? 'All flagged vehicles have been moderated.' : 'There are currently no car listings in the database.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/80 text-[11px] font-bold text-textSecondary uppercase tracking-wider select-none">
                      <th className="py-3.5 px-5">Vehicle</th>
                      <th className="py-3.5 px-4">Year & Model</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Status & Moderation</th>
                      {activeTab === 'flagged' && <th className="py-3.5 px-4">Risk Flag</th>}
                      <th className="py-3.5 px-4">Seller Info</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {listings.map((listing) => {
                      const sellerName = listing.seller?.name || 'Unknown Seller';
                      const sellerEmail = listing.seller?.email || 'N/A';
                      const sellerInitials = sellerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

                      return (
                        <tr key={listing._id} className="hover:bg-muted/15 transition-colors">
                          {/* Brand & Title */}
                          <td className="py-4 px-5 font-bold text-textPrimary">
                            <div className="flex flex-col">
                              <span className="text-sm font-extrabold text-textPrimary">
                                {listing.brand}
                              </span>
                              <span className="text-[11px] font-medium text-textSecondary">
                                {listing.model}
                              </span>
                            </div>
                          </td>

                          {/* Year & Model */}
                          <td className="py-4 px-4 font-semibold text-textSecondary">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/40 text-textPrimary text-xs font-bold">
                              {listing.year}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-4 px-4 font-extrabold text-primary text-sm whitespace-nowrap">
                            ₹{listing.price?.toLocaleString('en-IN')}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col items-start gap-1">
                              {getStatusBadge(listing.status)}
                              {listing.status === 'rejected' && listing.rejectionReason && (
                                <p className="text-[10px] text-danger font-semibold m-0 mt-0.5 bg-dangerLight/40 px-2 py-1 rounded-md border border-dangerBorder/40">
                                  Reason: {listing.rejectionReason}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Risk Flag (Flagged tab) */}
                          {activeTab === 'flagged' && (
                            <td className="py-4 px-4">
                              <Badge variant="warning">
                                {listing.riskFlag || 'Review Required'}
                              </Badge>
                            </td>
                          )}

                          {/* Seller Info */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[11px] flex items-center justify-center shrink-0 border border-primary/20">
                                {sellerInitials}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-textPrimary truncate">{sellerName}</span>
                                <span className="text-[11px] text-textSecondary truncate">{sellerEmail}</span>
                              </div>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {rejectingId === listing._id ? (
                                <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1.5 shadow-sm">
                                  <input
                                    ref={rejectInputRef}
                                    type="text"
                                    placeholder="Enter rejection reason..."
                                    value={rejectReason}
                                    onChange={(e) => {
                                      setRejectReason(e.target.value);
                                      if (rejectError && e.target.value.trim() !== '') {
                                        setRejectError('');
                                      }
                                    }}
                                    className="bg-bgLight border border-border rounded-lg px-2.5 py-1 text-xs text-textPrimary focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-52"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmReject(listing._id)}
                                    className="px-3 py-1 bg-danger hover:bg-dangerHover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border-none"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelReject}
                                    className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-textSecondary text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Link to={`/listings/${listing._id}`} state={{ fromAdmin: true, adminTab: activeTab, adminPage: page }}>
                                    <Button variant="outline" size="sm" className="px-3 py-1 text-xs">
                                      View
                                    </Button>
                                  </Link>

                                  {listing.status !== 'active' && listing.status !== 'rented' && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleApprove(listing._id)}
                                      className="px-3 py-1 text-xs bg-success hover:bg-success/90 border-none"
                                    >
                                      Approve
                                    </Button>
                                  )}

                                  {listing.status !== 'rejected' && listing.status !== 'rented' && (
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleStartReject(listing._id)}
                                      className="px-3 py-1 text-xs"
                                    >
                                      Reject
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                            {rejectingId === listing._id && rejectError && (
                              <p className="text-[10px] text-danger font-bold mt-1 m-0 text-right">
                                {rejectError}
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-textSecondary">
                Showing Page <span className="font-bold text-textPrimary">{page}</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setSearchParams({ tab: activeTab, page: Math.max(page - 1, 1).toString() })}
                  className="text-xs px-3 py-1.5"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={listings.length < LIMIT}
                  onClick={() => setSearchParams({ tab: activeTab, page: (page + 1).toString() })}
                  className="text-xs px-3 py-1.5"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;




