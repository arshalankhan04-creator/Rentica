import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    navigate('/');
  };

  const initials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '';

  return (
    <nav className="w-full bg-surface border-b border-border py-4 px-6 md:px-8 z-30 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left Side: Logo */}
        <Link 
          to="/" 
          className="text-2xl no-underline tracking-wide"
          style={{ fontFamily: 'Anoxic, sans-serif', color: 'var(--color-textPrimary)', fontWeight: 500 }}
        >
          Valora
        </Link>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/browse" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            Buy
          </Link>
          <Link to="/create-listing" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            Sell
          </Link>
          <Link to="/finance" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            Finance
          </Link>
          <Link to="/about" className="text-textSecondary hover:text-primary font-semibold no-underline transition-colors text-sm">
            About
          </Link>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
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

                  <Link
                    to="/inquiries"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-primary no-underline font-semibold"
                  >
                    My Inquiries
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
