import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setIsError(true);
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await api.post('/auth/subscribe-alerts', { email });
      setMessage(res.data?.message || 'Subscribed to price drop alerts!');
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-8 w-full">
        {/* Top 3-Column Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 pb-12 border-b border-border/40 text-left">
          
          {/* Column 1 (3 cols): MARKETPLACE */}
          <div className="md:col-span-3 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-4 select-none">
              Marketplace
            </span>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <Link to="/browse" className="text-xs font-semibold text-textSecondary hover:text-primary transition-colors duration-200 no-underline">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-xs font-semibold text-textSecondary hover:text-primary transition-colors duration-200 no-underline">
                  Sell Your Car
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-xs font-semibold text-textSecondary hover:text-primary transition-colors duration-200 no-underline">
                  Compare Vehicles
                </Link>
              </li>
              <li>
                <span className="text-xs font-semibold text-textSecondary/50 cursor-not-allowed flex items-center gap-1.5 select-none">
                  Great Deals
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-background border border-border/60 text-textSecondary uppercase">Coming Soon</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2 (4 cols): TRUST & INTELLIGENCE */}
          <div className="md:col-span-4 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-4 select-none">
              Trust & Intelligence
            </span>
            <ul className="list-none p-0 m-0 space-y-3">
              <li>
                <Link to="/about" className="text-xs font-semibold text-textSecondary hover:text-primary transition-colors duration-200 no-underline">
                  About Valora AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 (5 cols): STAY CONNECTED (Price Drop Alerts) */}
          <div className="md:col-span-5 flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textSecondary mb-4 select-none">
              Stay Connected
            </span>
            <p className="text-xs font-medium text-textSecondary leading-relaxed m-0 mb-3">
              Get price drop alerts and newly verified vehicle listings via email.
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-md">
              <div className="flex items-center w-full bg-background border border-border/80 rounded-full p-1 shadow-inner focus-within:border-primary transition-all">
                <input
                  type="email"
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-xs text-textPrimary placeholder:text-textSecondary/60 px-4 py-1.5 focus:outline-none border-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-xs shrink-0 border-none disabled:opacity-50"
                >
                  {loading ? '...' : 'Join'}
                </button>
              </div>
            </form>

            {message && (
              <p className={`text-[11px] font-bold mt-2.5 m-0 text-left ${isError ? 'text-danger' : 'text-emerald-500'}`}>
                {isError ? '⚠️ ' : '✓ '}{message}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Giant Branding Wordmark */}
        <div className="w-full pt-10 select-none overflow-hidden flex items-center justify-center">
          <div 
            className="text-[6.5rem] sm:text-[10rem] md:text-[13rem] lg:text-[16rem] uppercase m-0 leading-none text-center"
            style={{ fontFamily: 'Anoxic, sans-serif', color: 'var(--color-textPrimary)', fontWeight: 500, letterSpacing: '0.05em' }}
          >
            Valora
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
