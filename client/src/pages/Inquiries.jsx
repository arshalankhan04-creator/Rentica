import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Inquiries = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeThreadLoading, setActiveThreadLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'unread', 'archived'

  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState('');

  const scrollerRef = useRef(null);

  // Local storage states for archive and read management
  const currentUserId = user?._id || user?.id || '';
  const [archivedIds, setArchivedIds] = useState([]);
  const [lastViewed, setLastViewed] = useState({});

  useEffect(() => {
    if (!currentUserId) return;
    try {
      const rawArchived = localStorage.getItem(`valora-archived-threads-${currentUserId}`);
      if (rawArchived) setArchivedIds(JSON.parse(rawArchived));
      
      const rawViewed = localStorage.getItem(`valora-last-viewed-${currentUserId}`);
      if (rawViewed) setLastViewed(JSON.parse(rawViewed));
    } catch (err) {
      console.error('Error loading local thread states:', err);
    }
  }, [currentUserId]);

  // Fetch threads list (only once or on mount)
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchThreads = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/inquiries/mine');
        setThreads(res.data);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        setError(err.response?.data?.message || 'Failed to fetch inquiries.');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [user, authLoading]);

  // Fetch individual thread when ID URL parameter changes
  useEffect(() => {
    if (!id || authLoading || !user) {
      setThread(null);
      return;
    }

    const fetchSingleThread = async () => {
      setActiveThreadLoading(true);
      setReplyError('');
      try {
        const res = await api.get(`/inquiries/${id}`);
        setThread(res.data);
        
        // Update last viewed timestamp in local storage
        const rawViewed = localStorage.getItem(`valora-last-viewed-${currentUserId}`);
        const viewedMap = rawViewed ? JSON.parse(rawViewed) : {};
        const updated = { ...viewedMap, [id]: new Date().toISOString() };
        setLastViewed(updated);
        localStorage.setItem(`valora-last-viewed-${currentUserId}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Error fetching thread details:', err);
      } finally {
        setActiveThreadLoading(false);
      }
    };

    fetchSingleThread();
  }, [id, user, authLoading, currentUserId]);

  // Refetch messages helper for replies
  const refetchMessagesOnly = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/inquiries/${id}`);
      setThread(res.data);
      
      // Update last viewed immediately to mark incoming messages as read
      const updated = { ...lastViewed, [id]: new Date().toISOString() };
      setLastViewed(updated);
      localStorage.setItem(`valora-last-viewed-${currentUserId}`, JSON.stringify(updated));
    } catch (err) {
      console.error('Error refetching messages:', err);
    }
  };

  // Scroll to bottom of chat history when messages change
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [thread?.messages, activeThreadLoading]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !id) return;

    setReplyError('');
    setReplyLoading(true);
    try {
      await api.post(`/inquiries/${id}/messages`, { text: replyText });
      setReplyText('');
      await refetchMessagesOnly();
      
      // Update list of threads to bubble the current thread to the top and refresh snippet
      const res = await api.get('/inquiries/mine');
      setThreads(res.data);
    } catch (err) {
      console.error('Error sending reply:', err);
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  const toggleArchive = () => {
    if (!id) return;
    let nextArchived;
    if (archivedIds.includes(id.toString())) {
      nextArchived = archivedIds.filter(x => x !== id.toString());
    } else {
      nextArchived = [...archivedIds, id.toString()];
    }
    setArchivedIds(nextArchived);
    localStorage.setItem(`valora-archived-threads-${currentUserId}`, JSON.stringify(nextArchived));
  };

  if (authLoading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-textSecondary text-xs font-bold m-0">Loading authentication status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-20 text-center flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 bg-dangerLight border border-dangerBorder rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-textPrimary mb-2 m-0">Access Denied</h2>
        <p className="text-textSecondary text-xs max-w-[320px] mx-auto m-0 mb-6 font-semibold">
          Please log in to view your inquiries.
        </p>
        <Link to="/login" className="text-xs font-bold text-primary hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-bgLight min-h-screen py-24 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-textSecondary text-xs font-bold m-0">Loading inquiries...</p>
      </div>
    );
  }

  // Calculate unread count for a given thread
  const getUnreadCount = (threadItem) => {
    const lastViewedTime = lastViewed[threadItem._id];
    if (!lastViewedTime) {
      return (threadItem.messages || []).filter(m => {
        const senderId = m.sender?._id || m.sender;
        return senderId && senderId.toString() !== currentUserId.toString();
      }).length;
    }
    return (threadItem.messages || []).filter(m => {
      const senderId = m.sender?._id || m.sender;
      const isOther = senderId && senderId.toString() !== currentUserId.toString();
      const sentAt = m.sentAt || m.createdAt || new Date();
      return isOther && new Date(sentAt) > new Date(lastViewedTime);
    }).length;
  };

  // Helper to format relative time
  const formatRelative = (dateStr) => {
    if (!dateStr) return '';
    const ts = new Date(dateStr).getTime();
    const diff = Date.now() - ts;
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;
    
    if (diff < min) return 'now';
    if (diff < hr) return `${Math.max(1, Math.floor(diff / min))}m`;
    if (diff < day) return `${Math.floor(diff / hr)}h`;
    if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
    return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Format message time
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Format date divider
  const getDividerLabel = (date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    if (isSameDay(date, today)) {
      return 'Today';
    }
    if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Dynamic city resolution scanning listing description
  const getListingCity = (listing) => {
    if (!listing) return 'N/A';
    const desc = (listing.description || '').toLowerCase();
    const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad'];
    for (const city of cities) {
      if (desc.includes(city.toLowerCase())) {
        return city;
      }
    }
    return 'Bengaluru'; // Default fallback city
  };

  // Filter and enrich threads
  const enrichedThreads = threads.map(t => {
    const isBuyer = t.buyer && t.buyer._id?.toString() === currentUserId.toString();
    const otherParty = isBuyer ? t.seller : t.buyer;
    const otherPartyName = otherParty ? otherParty.name : 'Unknown User';
    const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
    const isArchived = archivedIds.includes(t._id.toString());
    const unreadNum = getUnreadCount(t);

    return {
      thread: t,
      otherPartyName,
      lastMsg,
      isArchived,
      unreadNum
    };
  });

  // Count tabs
  const tabCounts = {
    active: enrichedThreads.filter(t => !t.isArchived).length,
    unread: enrichedThreads.filter(t => !t.isArchived && t.unreadNum > 0).length,
    archived: enrichedThreads.filter(t => t.isArchived).length
  };

  // Filter visible threads based on search query and active filter tab
  const visibleThreads = enrichedThreads
    .filter(t => {
      if (activeTab === 'archived') return t.isArchived;
      if (activeTab === 'unread') return !t.isArchived && t.unreadNum > 0;
      return !t.isArchived;
    })
    .filter(t => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const vehicleName = t.thread.listing ? `${t.thread.listing.brand} ${t.thread.listing.model}` : '';
      const snippet = t.lastMsg ? t.lastMsg.text : '';
      return (
        t.otherPartyName.toLowerCase().includes(q) ||
        vehicleName.toLowerCase().includes(q) ||
        snippet.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.thread.updatedAt).getTime() - new Date(a.thread.updatedAt).getTime());

  // Render tab pill matching Valora's design tokens and support dark mode
  const renderTabPill = (tabId, label, count, iconSvg) => {
    const isActive = activeTab === tabId;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(tabId)}
        className={`flex items-center gap-1.5 py-1 px-3.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer select-none focus:outline-none flex-shrink-0 ${
          isActive
            ? 'border-primary text-primary bg-primary/5'
            : 'border-border text-textSecondary bg-transparent hover:border-textSecondary/40 hover:text-textPrimary'
        }`}
      >
        {iconSvg}
        <span>{label}</span>
        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
          isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-textSecondary'
        }`}>
          {count}
        </span>
      </button>
    );
  };

  // Active chat details variables
  const activeOtherPartyName = thread
    ? (thread.buyer && thread.buyer._id?.toString() === currentUserId.toString()
      ? (thread.seller ? thread.seller.name : 'Unknown User')
      : (thread.buyer ? thread.buyer.name : 'Unknown User'))
    : '';

  const activeListingImg = thread?.listing?.images?.[0]
    ? (thread.listing.images[0].startsWith('http') ? thread.listing.images[0] : `http://localhost:5000/${thread.listing.images[0]}`)
    : null;
  const activeListingCity = thread ? getListingCity(thread.listing) : 'Bengaluru';
  const activeListingPrice = thread?.listing ? `₹${(thread.listing.price / 100000).toFixed(2)} L` : 'N/A';
  const activeListingKm = thread?.listing?.kmDriven ? `${thread.listing.kmDriven.toLocaleString()} km` : 'N/A km';
  const activeTrustScore = thread?.listing?.trustScore !== null && thread?.listing?.trustScore !== undefined ? `Trust ${thread.listing.trustScore}` : 'Trust N/A';

  const isCurrentThreadArchived = id && archivedIds.includes(id.toString());

  let lastDateStr = null;

  return (
    <div className="w-full bg-bgLight min-h-[calc(100vh-80px)] py-10 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto px-6 w-full text-left flex-1 flex flex-col">
        
        {/* Two-Pane Inbox Card Layout */}
        <div className="bg-surface border border-border rounded-card-lg overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[600px] h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] flex-1">
          
          {/* Left Side: Inbox List Column (4 cols) */}
          <div className={`md:col-span-4 border-r border-border flex flex-col h-full bg-surface overflow-hidden min-h-0 ${id ? 'hidden md:flex' : 'flex'}`}>
            {/* Header section with title, search and tabs inside the sidebar */}
            <div className="p-4 border-b border-border flex flex-col gap-3 select-none flex-shrink-0 bg-surface">
              {/* Title bar with New Button matching reference image */}
              <div className="flex items-center justify-between mb-1 select-none">
                <h2 className="text-xl font-bold text-textPrimary m-0">
                  Messages
                </h2>
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-1 bg-surface hover:bg-background border border-border text-textSecondary px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all no-underline shadow-sm hover:text-textPrimary"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  New
                </Link>
              </div>

              {/* Search conversations */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-textPrimary placeholder-textSecondary/55 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Filter Tab pills */}
              <div className="flex gap-1.5 mt-1 overflow-x-auto no-scrollbar py-1">
                {renderTabPill(
                  'active',
                  'Active',
                  tabCounts.active,
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.008 1.24l.885 1.77a2.25 2.25 0 002.007 1.24h1.98a2.25 2.25 0 002.007-1.24l.885-1.77a2.25 2.25 0 012.007-1.24h3.86m-18 0h18" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5v6.75A2.25 2.25 0 004.5 22.5h15a2.25 2.25 0 002.25-2.25v-6.75m-18 0A2.25 2.25 0 014.5 11.25h15a2.25 2.25 0 012.25 2.25M9 3.75h6" />
                  </svg>
                )}
                {renderTabPill(
                  'unread',
                  'Unread',
                  tabCounts.unread,
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                )}
                {renderTabPill(
                  'archived',
                  'Archived',
                  tabCounts.archived,
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40 scrollbar-thin">
              {visibleThreads.length === 0 ? (
                <div className="py-20 text-center p-6 text-textSecondary font-semibold text-xs leading-relaxed select-none">
                  {query
                    ? 'No matches found for your search.'
                    : activeTab === 'unread'
                    ? 'No unread conversations.'
                    : activeTab === 'archived'
                    ? 'No archived conversations.'
                    : 'Your conversations will appear here.'}
                </div>
              ) : (
                visibleThreads.map(({ thread: t, otherPartyName: tName, lastMsg, unreadNum }) => {
                  const vehicleName = t.listing 
                    ? `${t.listing.brand} ${t.listing.model}` 
                    : 'Deleted Vehicle';
                  const priceStr = t.listing ? ` · ₹${(t.listing.price / 100000).toFixed(2)} L` : '';
                  const snippet = lastMsg ? lastMsg.text : 'No messages yet';
                  const isActive = id && t._id.toString() === id.toString();
                  const dbImg = t.listing?.images?.[0];
                  const listingImg = dbImg ? (dbImg.startsWith('http') ? dbImg : `http://localhost:5000/${dbImg}`) : null;
                  const timeRelative = lastMsg ? formatRelative(lastMsg.sentAt || lastMsg.createdAt) : '';

                  return (
                    <div 
                      key={t._id}
                      onClick={() => navigate(`/inquiries/${t._id}`)}
                      className={`p-3.5 hover:bg-background/70 cursor-pointer transition-all flex items-start gap-3 border-b border-border/40 text-left relative ${
                        isActive ? 'bg-primary/5 border-l-[3px] border-primary' : ''
                      }`}
                    >
                      {/* Car Thumbnail Box */}
                      <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 flex-shrink-0 select-none border border-border/70 relative overflow-hidden flex items-center justify-center shadow-sm">
                        {listingImg ? (
                          <img src={listingImg} className="w-full h-full object-cover" alt="vehicle" />
                        ) : (
                          <svg viewBox="0 0 120 60" className="absolute inset-0 h-full w-full p-1 text-primary/40" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M10 45 L25 25 L60 22 L95 25 L110 45 Z" strokeLinejoin="round" />
                            <circle cx="35" cy="45" r="6" fill="currentColor" opacity="0.2" />
                            <circle cx="85" cy="45" r="6" fill="currentColor" opacity="0.2" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Snippet Block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 leading-none">
                          <span className="font-bold text-xs text-textPrimary truncate inline-flex items-center gap-1">
                            {tName}
                            <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                          <span className="text-[9px] text-textSecondary font-bold select-none whitespace-nowrap">
                            {timeRelative}
                          </span>
                        </div>
                        <span className="text-[10px] text-textSecondary font-bold block mt-1 truncate">
                          {vehicleName}{priceStr}
                        </span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <span className={`text-xs truncate block ${unreadNum > 0 ? 'text-textPrimary font-bold' : 'text-textSecondary'}`}>
                            {lastMsg?.sender?._id?.toString() === currentUserId.toString() || lastMsg?.sender?.toString() === currentUserId.toString() ? 'You: ' : ''}
                            {snippet}
                          </span>
                          {unreadNum > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                              {unreadNum}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Side: Conversation Chat Panel (8 cols) - min-h-0 prevents box growth */}
          <div className={`md:col-span-8 flex flex-col h-full bg-surface overflow-hidden min-h-0 ${id ? 'flex' : 'hidden md:flex'}`}>
            {activeThreadLoading ? (
              // Active Thread Loading spinner
              <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-background/35 select-none">
                <div className="w-10 h-10 border-4 border-primary/15 border-t-primary rounded-full animate-spin" />
                <p className="text-textSecondary text-xs font-bold m-0">Loading messages...</p>
              </div>
            ) : thread ? (
              // Conversation Pane
              <>
                {/* Header: User & Vehicle Details bar */}
                <div className="p-3.5 border-b border-border flex items-center gap-3 bg-surface flex-shrink-0 select-none">
                  {/* Back to inbox button (mobile only) */}
                  <button
                    type="button"
                    onClick={() => navigate('/inquiries')}
                    className="grid h-9 w-9 flex-none place-items-center rounded-full text-textSecondary hover:bg-background hover:text-textPrimary md:hidden border-none cursor-pointer bg-transparent focus:outline-none"
                    aria-label="Back to conversations"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                  </button>

                  {thread.listing ? (
                    <>
                      {/* Car Thumbnail */}
                      <div className="w-14 h-12 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 flex-shrink-0 border border-border/70 relative overflow-hidden flex items-center justify-center shadow-sm">
                        {activeListingImg ? (
                          <img src={activeListingImg} className="w-full h-full object-cover" alt="vehicle" />
                        ) : (
                          <svg viewBox="0 0 120 60" className="absolute inset-0 h-full w-full p-1 text-primary/40" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M10 45 L25 25 L60 22 L95 25 L110 45 Z" strokeLinejoin="round" />
                            <circle cx="35" cy="45" r="6" fill="currentColor" opacity="0.2" />
                            <circle cx="85" cy="45" r="6" fill="currentColor" opacity="0.2" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Vehicle Details */}
                      <div className="text-left flex-1 min-w-0">
                        <Link
                          to={`/listings/${thread.listing._id}`}
                          className="font-bold text-[14px] text-textPrimary leading-tight truncate hover:text-primary transition-all no-underline block"
                        >
                          {thread.listing.brand} {thread.listing.model}
                        </Link>
                        <div className="flex flex-wrap items-center mt-1 leading-none text-[11px] text-gray-500 font-bold gap-x-2 gap-y-1">
                          <span className="text-primary font-extrabold">{activeListingPrice}</span>
                          <span className="text-border select-none">·</span>
                          <span>{activeListingKm}</span>
                          <span className="text-border select-none">·</span>
                          <span>{activeListingCity}</span>
                          <span className="text-border select-none">·</span>
                          
                          {/* Trust Score badge */}
                          <span className="px-2 py-0.5 rounded-full border border-successBorder bg-successLight text-success text-[10px] font-bold inline-flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21a3.745 3.745 0 01-3.068-.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                            </svg>
                            {activeTrustScore}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-left flex-1">
                      <span className="text-xs font-semibold text-textSecondary select-none">Vehicle listing deleted</span>
                    </div>
                  )}

                  {/* Header Actions */}
                  <div className="flex flex-none items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleArchive}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-textSecondary hover:bg-background cursor-pointer focus:outline-none shadow-sm hover:text-textPrimary"
                      aria-label={isCurrentThreadArchived ? "Unarchive conversation" : "Archive conversation"}
                    >
                      {isCurrentThreadArchived ? (
                        <svg className="w-3.5 h-3.5 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6-6m0 0l6 6m-6-6v12a6 6 0 01-12 0v-3" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      )}
                      <span>{isCurrentThreadArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>

                    {thread.listing && (
                      <Link
                        to={`/listings/${thread.listing._id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-bold text-textSecondary hover:bg-background cursor-pointer no-underline shadow-sm hover:text-textPrimary"
                      >
                        <svg className="w-3.5 h-3.5 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        <span>View listing</span>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Sub-header: Other Participant Status Bar */}
                <div className="flex items-center justify-between border-b border-border bg-bgLight px-4 py-2 select-none flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 flex-none rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center uppercase shadow-sm">
                      {activeOtherPartyName.slice(0, 1)}
                    </div>
                    <div className="min-w-0 text-left leading-none">
                      <p className="truncate text-xs font-bold text-textPrimary m-0 inline-flex items-center gap-1">
                        {activeOtherPartyName}
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </p>
                      <p className="text-[10px] text-textSecondary font-bold mt-1.5 m-0 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-textSecondary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Usually replies in 2h
                      </p>
                    </div>
                  </div>
                  
                  <span className="px-2.5 py-0.5 rounded-full border border-successBorder bg-successLight text-success text-[9px] font-extrabold uppercase tracking-wide">
                    Live demo
                  </span>
                </div>

                {/* Message Bubble History viewport */}
                <div 
                  ref={scrollerRef} 
                  className="flex-1 p-6 overflow-y-auto min-h-0 space-y-4 bg-background/35 flex flex-col scrollbar-thin"
                >
                  {thread.messages && thread.messages.length === 0 ? (
                    <div className="my-auto text-center p-6 text-textSecondary font-semibold text-xs leading-relaxed select-none">
                      No messages yet. Send a note to start the conversation!
                    </div>
                  ) : (
                    thread.messages.map((msg, index) => {
                      const senderId = msg.sender?._id || msg.sender;
                      const isMe = senderId && senderId.toString() === currentUserId.toString();
                      const senderName = isMe ? 'You' : activeOtherPartyName;

                      // Parse dates correctly using sentAt
                      const msgDate = msg.sentAt ? new Date(msg.sentAt) : (msg.createdAt ? new Date(msg.createdAt) : new Date());
                      const dateKey = msgDate.toDateString();
                      const showDivider = dateKey !== lastDateStr;
                      lastDateStr = dateKey;

                      const formattedTime = formatTime(msgDate);

                      return (
                        <React.Fragment key={msg._id || index}>
                          {showDivider && (
                            <div className="w-full flex justify-center my-4 select-none">
                              <span className="bg-surface text-textSecondary text-[10px] font-bold px-3 py-1 rounded-full border border-border/80 shadow-sm">
                                {getDividerLabel(msgDate)}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                              {!isMe && (
                                <span className="text-[9px] font-bold text-textSecondary mb-1 px-1.5 select-none">
                                  {senderName}
                                </span>
                              )}
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-sm leading-relaxed whitespace-pre-wrap select-text text-left relative min-w-[60px] ${
                                  isMe
                                    ? 'bg-secondary text-white rounded-br-sm'
                                    : 'bg-surface border border-border text-textPrimary rounded-bl-sm'
                                }`}
                              >
                                <span>{msg.text}</span>
                                <div className={`mt-1.5 text-[9px] font-bold select-none ${isMe ? 'text-white/70 text-right' : 'text-textSecondary text-left'}`}>
                                  {formattedTime}
                                </div>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                </div>

                {/* Composer Section */}
                <div className="p-4 bg-surface border-t border-border flex flex-col gap-2 flex-shrink-0">
                  {replyError && (
                    <span className="text-[10px] font-semibold text-danger px-2 block select-none text-left">
                      {replyError}
                    </span>
                  )}
                  <form
                    onSubmit={handleSendReply}
                    className="flex items-center gap-3 bg-transparent select-none"
                  >
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        if (replyError && e.target.value.trim() !== '') {
                          setReplyError('');
                        }
                      }}
                      disabled={replyLoading}
                      placeholder={`Message ${activeOtherPartyName.split(' ')[0]}...`}
                      className="flex-1 bg-background border border-border rounded-full px-5 py-2.5 text-xs font-semibold text-textPrimary placeholder-textSecondary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent transition-all shadow-sm"
                    />

                    <button
                      type="submit"
                      disabled={replyLoading || !replyText.trim()}
                      className="w-10 h-10 rounded-full bg-secondary hover:bg-secondaryHover text-white flex items-center justify-center cursor-pointer transition-colors border-none disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 focus:outline-none shadow-md"
                    >
                      <svg className="w-4 h-4 transform rotate-45 -translate-x-[1px] translate-y-[0.5px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              // Right Side: Conversation Placeholder Column (8 cols)
              <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background/10 text-center select-none h-full overflow-y-auto">
                <div className="max-w-md w-full flex flex-col items-center">
                  {/* Chat Icon Box */}
                  <div className="w-16 h-16 rounded-[20px] bg-surface border border-border/80 flex items-center justify-center mb-8 text-primary shadow-sm">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  {/* Title & Subtitle */}
                  <h3 className="text-xl md:text-2xl font-bold text-textPrimary m-0 mb-3 leading-tight">
                    Select a conversation
                  </h3>
                  <p className="text-xs text-textSecondary max-w-sm mx-auto m-0 mb-8 leading-relaxed font-semibold">
                    Your conversations about car listings will appear here. Each thread stays tied to a specific listing so nothing gets confused.
                  </p>

                  {/* Horizontal Cards Group */}
                  <div className="w-full max-w-[360px] space-y-3 mt-2">
                    {/* One thread per listing */}
                    <div className="w-full bg-surface border border-border/70 rounded-2xl p-3 flex items-start gap-4 text-left shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary border border-primary/5 mt-0.5">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125v-3.07c0-.733-.407-1.404-1.06-1.737l-3.344-1.706a2.25 2.25 0 0 0-1.897-.13L15 8.25M2.25 14.25h19.5m-19.5 0v-2.25a2.25 2.25 0 0 1 2.25-2.25h12c1.03 0 1.9.693 2.166 1.638l.89 3.195m-1.551-.333H2.25" />
                        </svg>
                      </div>
                      <div className="leading-snug min-w-0">
                        <h4 className="text-xs font-bold text-textPrimary m-0">One thread per listing</h4>
                        <p className="text-[10px] text-textSecondary m-0 mt-0.5 leading-normal font-semibold">
                          Two cars from the same seller become two separate chats.
                        </p>
                      </div>
                    </div>

                    {/* Listing context pinned */}
                    <div className="w-full bg-surface border border-border/70 rounded-2xl p-3 flex items-start gap-4 text-left shadow-sm">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary border border-secondary/5 mt-0.5">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21a3.745 3.745 0 01-3.068-.593 3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                      </div>
                      <div className="leading-snug min-w-0">
                        <h4 className="text-xs font-bold text-textPrimary m-0">Listing context pinned</h4>
                        <p className="text-[10px] text-textSecondary m-0 mt-0.5 leading-normal font-semibold">
                          Price, kilometres and trust signals stay visible while you chat.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Browse cars link */}
                  <Link 
                    to="/browse" 
                    className="mt-6 px-8 py-3.5 rounded-full border border-border bg-surface text-textPrimary hover:bg-background hover:text-primary text-xs font-bold transition-all shadow-sm no-underline block select-none"
                  >
                    Browse cars to start a chat
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Inquiries;
