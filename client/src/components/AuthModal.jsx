import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import Input from './Input';

const AuthModal = ({ mode: initialMode, onClose, onSuccess }) => {
  const { login, register, authModalCustomContent } = useAuth();
  
  const [mode, setMode] = useState(initialMode || 'login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic headers based on action or mode
  const defaultTitle = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const defaultDesc = mode === 'login' 
    ? 'Sign in to access your dashboard and message owners' 
    : 'Register to list vehicles, manage bookings, and track favorites';

  const displayTitle = authModalCustomContent?.title || defaultTitle;
  const displayDesc = authModalCustomContent?.description || defaultDesc;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setValidationError('Both email and password are required.');
        return;
      }
      
      setLoading(true);
      try {
        const data = await login(email, password);
        if (onSuccess) onSuccess(data.user);
      } catch (err) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setValidationError('Name, email, and password are required.');
        return;
      }

      setLoading(true);
      try {
        const data = await register(name, email, password, 'user', phone);
        if (onSuccess) onSuccess(data.user);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn select-none">
      {/* Modal Card */}
      <div 
        className="bg-surface border border-border rounded-card-lg p-6 md:p-8 max-w-sm w-full relative shadow-2xl text-left transform scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-background transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo/Branding Header */}
        <div className="text-center mb-6">
          <span 
            className="text-2xl tracking-wide select-none"
            style={{ fontFamily: 'Anoxic, sans-serif', color: 'var(--color-primary)', fontWeight: 500 }}
          >
            Rentica
          </span>
          <h3 className="text-lg font-bold text-textPrimary m-0 mt-2 select-none">
            {displayTitle}
          </h3>
          <p className="text-2xs text-textSecondary m-0 mt-1 select-none font-semibold leading-relaxed">
            {displayDesc}
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-border/50 mb-5 relative select-none">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setValidationError('');
            }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-none bg-transparent cursor-pointer ${
              mode === 'login' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setValidationError('');
            }}
            className={`flex-1 pb-2.5 text-xs font-bold transition-all border-none bg-transparent cursor-pointer ${
              mode === 'signup' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notifications */}
        {(error || validationError) && (
          <div className="w-full bg-dangerLight border border-dangerBorder text-danger text-[11px] font-bold rounded-xl p-3 mb-4 shadow-sm leading-normal">
            {error || validationError}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
              <Input
                label="Phone Number (Optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="md"
            fullWidth
            className="font-bold border-none shadow-sm h-11 mt-6 text-xs"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : mode === 'login' ? (
              'Log In to My Account'
            ) : (
              'Create My Account'
            )}
          </Button>
        </form>

        {/* Switch Toggle Mode links */}
        <div className="mt-5 text-center select-none">
          {mode === 'login' ? (
            <button
              onClick={() => {
                setMode('signup');
                setError('');
                setValidationError('');
              }}
              className="text-2xs font-bold text-textSecondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              Don't have an account? <span className="text-primary underline">Sign up</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setValidationError('');
              }}
              className="text-2xs font-bold text-textSecondary hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              Already have an account? <span className="text-primary underline">Log in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
