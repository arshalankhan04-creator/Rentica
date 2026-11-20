import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout, showAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentUserId = user?._id || user?.id;

  // Calculate unread inquiries count dynamically
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUserId) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/bookings/mine');
      const threads = res.data || [];

      let rawViewed = null;
      try {
        rawViewed = localStorage.getItem(`rentica-last-viewed-${currentUserId}`);
      } catch (_) {}
      const lastViewed = rawViewed ? JSON.parse(rawViewed) : {};

      let unreadThreadsCount = 0;
      threads.forEach((t) => {
        const lastViewedTime = lastViewed[t._id];
        const hasUnreadMessage = (t.messages || []).some((m) => {
          const senderId = m.sender?._id || m.sender;
          if (senderId && senderId.toString() !== currentUserId.toString()) {
            const msgTime = m.sentAt || m.createdAt;
            return !lastViewedTime || new Date(msgTime) > new Date(lastViewedTime);
          }
          return false;
        });

        if (hasUnreadMessage) {
          unreadThreadsCount += 1;
        }
      });

      setUnreadCount(unreadThreadsCount);
    } catch (_) {
      // Fail silently for unread count indicator
    }
  }, [currentUserId]);

  // Fetch on mount, user change, route change, window focus & 30s interval
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    const handleFocus = () => fetchUnreadCount();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUnreadCount, location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setUnreadCount(0);
    navigate('/');
  };

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '';

  return (
    <nav className="w-full bg-surface border-b border-border py-4 z-30 relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Left Side: Logo */}
        <div className="flex-1 flex items-center justify-start">
          <Link 
            to="/" 
            className="text-2xl no-underline tracking-wide"
            style={{ fontFamily: 'Anoxic, sans-serif', color: 'var(--color-textPrimary)', fontWeight: 500 }}
          >
            Rentica
          </Link>
        </div>

        {/* Center: Nav links (Visually & Mathematically Centered) */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-8">
          <Link to="/browse" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            Rent
          </Link>
          <Link to="/compare" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            Compare
          </Link>
          <Link 
            to="/create-listing" 
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                showAuthModal('login', () => navigate('/create-listing'), {
                  title: 'List Your Car',
                  description: 'Log in or sign up to register your vehicle and list it on Rentica.'
                });
              }
            }}
            className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm"
          >
            List
          </Link>
          <Link to="/about" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            About
          </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Chat / Messages Icon Button */}
          <button
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                showAuthModal('login', () => navigate('/bookings'), {
                  title: 'Messages & Bookings',
                  description: 'Log in to view your bookings and chat with vehicle owners.'
                });
              } else {
                navigate('/bookings');
              }
            }}
            className="relative flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-border/70 text-textSecondary hover:text-primary hover:border-primary/40 hover:bg-background transition-all cursor-pointer focus:outline-none shadow-xs"
            title="Messages & Bookings"
            aria-label="Messages & Bookings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.049-.85 5.97 5.97 0 011.08-1.785A7.95 7.95 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center border border-white shadow-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-transparent border-none p-1 cursor-pointer focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-textSecondary hover:text-primary">
                  {user.name.split(' ')[0]}
                </span>
                <svg className={`w-4 h-4 text-textSecondary/80 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg py-2 z-50 text-left">
                  <div className="px-4 py-2 border-b border-border/40">
                    <p className="text-xs font-bold text-textSecondary uppercase tracking-wider m-0">Role: {user.role}</p>
                    <p className="text-sm font-bold text-textPrimary m-0 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  {user.role !== 'admin' && (
                    <>
                      <Link
                        to="/my-listings"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-primary no-underline font-semibold"
                      >
                        My Listings
                      </Link>
                      <Link
                        to="/create-listing"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-primary no-underline font-semibold"
                      >
                        Add Listing
                      </Link>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-primary no-underline font-semibold"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <Link
                    to="/wishlist"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-primary no-underline font-semibold"
                  >
                    Wishlist
                  </Link>

                  <div className="border-t border-border/40 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-dangerLight hover:text-danger font-semibold bg-transparent border-none cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="no-underline">
                <Button variant="flat" size="sm" className="font-bold text-sm">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="no-underline">
                <Button variant="primary" pill size="sm" className="font-bold text-sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
