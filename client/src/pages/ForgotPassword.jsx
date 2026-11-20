import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/Button';

// Local Pupil Component
const Pupil = ({ 
  size = 12, 
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  );
};

// Local EyeBall Component
const EyeBall = ({ 
  size = 48, 
  pupilSize = 16, 
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };

    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }

    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    return { x, y };
  };

  const pupilPosition = calculatePupilPosition();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? '2px' : `${size}px`,
        backgroundColor: eyeColor,
        overflow: 'hidden',
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        />
      )}
    </div>
  );
};

const ForgotPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationError, setValidationError] = useState('');
  const [loading, setLoading] = useState(false);

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);

  const purpleRef = useRef(null);
  const blackRef = useRef(null);
  const yellowRef = useRef(null);
  const orangeRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking loops
  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return timeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return timeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // Mutual look when typing starts
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  const calculatePosition = (ref) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;

    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-15, Math.min(15, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Email address is required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'If that email is registered, a reset link has been sent.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden grid lg:grid-cols-2 bg-bgLight font-sans">
      
      {/* Decorative characters column */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-[#4F46E5] to-primaryDark p-12 text-white overflow-hidden select-none h-full">
        <div className="relative z-20">
          <Link 
            to="/" 
            className="text-2xl no-underline tracking-wide block"
            style={{ fontFamily: 'Anoxic, sans-serif', color: '#FFFFFF', fontWeight: 500 }}
          >
            Rentica
          </Link>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: '550px', height: '400px' }}>
            
            {/* Purple Character */}
            <div 
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '70px',
                width: '180px',
                height: isTyping ? '440px' : '400px',
                backgroundColor: 'var(--color-socialIndigo)',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: isTyping
                  ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` 
                  : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: isLookingAtEachOther ? `${55}px` : `${45 + purplePos.faceX}px`,
                  top: isLookingAtEachOther ? `${65}px` : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor='var(--color-animCharcoal)' 
                  isBlinking={isPurpleBlinking}
                  forceLookX={isLookingAtEachOther ? 3 : undefined}
                  forceLookY={isLookingAtEachOther ? 4 : undefined}
                />
                <EyeBall 
                  size={18} 
                  pupilSize={7} 
                  maxDistance={5} 
                  eyeColor="white" 
                  pupilColor='var(--color-animCharcoal)' 
                  isBlinking={isPurpleBlinking}
                  forceLookX={isLookingAtEachOther ? 3 : undefined}
                  forceLookY={isLookingAtEachOther ? 4 : undefined}
                />
              </div>
            </div>

            {/* Black Character */}
            <div 
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '240px',
                width: '120px',
                height: '310px',
                backgroundColor: 'var(--color-animCharcoal)',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: isLookingAtEachOther
                  ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                  : isTyping
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` 
                    : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: isLookingAtEachOther ? `${32}px` : `${26 + blackPos.faceX}px`,
                  top: isLookingAtEachOther ? `${12}px` : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor='var(--color-animCharcoal)' 
                  isBlinking={isBlackBlinking}
                  forceLookX={isLookingAtEachOther ? 0 : undefined}
                  forceLookY={isLookingAtEachOther ? -4 : undefined}
                />
                <EyeBall 
                  size={16} 
                  pupilSize={6} 
                  maxDistance={4} 
                  eyeColor="white" 
                  pupilColor='var(--color-animCharcoal)' 
                  isBlinking={isBlackBlinking}
                  forceLookX={isLookingAtEachOther ? 0 : undefined}
                  forceLookY={isLookingAtEachOther ? -4 : undefined}
                />
              </div>
            </div>

            {/* Orange Character */}
            <div 
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '0px',
                width: '240px',
                height: '200px',
                zIndex: 3,
                backgroundColor: 'var(--color-animOrange)',
                borderRadius: '120px 120px 0 0',
                transform: `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: `${82 + (orangePos.faceX || 0)}px`,
                  top: `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor='var(--color-animCharcoal)' />
                <Pupil size={12} maxDistance={5} pupilColor='var(--color-animCharcoal)' />
              </div>
            </div>

            {/* Yellow Character */}
            <div 
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: '310px',
                width: '140px',
                height: '230px',
                backgroundColor: 'var(--color-animYellow)',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div 
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: `${52 + (yellowPos.faceX || 0)}px`,
                  top: `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor='var(--color-animCharcoal)' />
                <Pupil size={12} maxDistance={5} pupilColor='var(--color-animCharcoal)' />
              </div>
              <div 
                className="absolute w-12 h-[4px] bg-animCharcoal rounded-full transition-all duration-200 ease-out"
                style={{
                  left: `${52 + (yellowPos.faceX || 0)}px`,
                  top: `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-white/50">
          <span className="hover:text-white cursor-not-allowed">Privacy Policy</span>
          <span className="hover:text-white cursor-not-allowed">Terms of Service</span>
          <span className="hover:text-white cursor-not-allowed">Contact</span>
        </div>

        <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:30px_30px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Right Form Column */}
      <div className="flex items-center justify-center p-8 bg-background h-full overflow-y-auto">
        <div className="w-full max-w-[380px] text-left">
          
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 select-none">
            <Link 
              to="/" 
              className="text-2xl no-underline tracking-wide block"
              style={{ fontFamily: 'Anoxic, sans-serif', color: 'var(--color-textPrimary)', fontWeight: 500 }}
            >
              Rentica
            </Link>
          </div>

          <div className="mb-8 select-none">
            <h1 className="text-3xl font-bold text-textPrimary tracking-tight mb-2">Reset Password</h1>
            <p className="text-textSecondary text-sm font-medium">Enter your registered email to receive a password reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {validationError && (
              <div className="p-4 text-xs font-semibold text-danger bg-dangerLight border border-dangerBorder rounded-2xl shadow-sm">
                {validationError}
              </div>
            )}
            
            {error && (
              <div className="p-4 text-xs font-semibold text-danger bg-dangerLight border border-dangerBorder rounded-2xl shadow-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 text-xs font-semibold text-success bg-successLight border border-successBorder rounded-2xl shadow-sm">
                {success}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="anna@gmail.com"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-surface text-xs font-semibold text-textPrimary placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary hover:border-muted-foreground/30 transition-all shadow-sm"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              variant="primary"
              size="lg"
              fullWidth
              className="font-bold"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="text-center text-xs font-semibold text-textSecondary mt-8 select-none">
            Remembered your password?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};

export default ForgotPassword;

