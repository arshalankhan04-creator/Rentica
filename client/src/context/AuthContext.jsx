import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthModal from '../components/AuthModal';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  // Auth Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [pendingAction, setPendingAction] = useState(null);
  const [authModalCustomContent, setAuthModalCustomContent] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Verify JWT on startup by fetching current user details
          const res = await api.get('/auth/me');
          setUser(res.data);
          
          // Fetch wishlist
          const wishRes = await api.get('/wishlist');
          setWishlist(wishRes.data.map(item => item._id));
        } catch (err) {
          console.error('Failed to restore user from token:', err.message);
          // Token is expired/invalid, clean up
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setWishlist([]);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: userToken, user: userData } = res.data;
    
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);

    // Fetch wishlist after login
    try {
      const wishRes = await api.get('/wishlist');
      setWishlist(wishRes.data.map(item => item._id));
    } catch (err) {
      console.error('Failed to load wishlist on login:', err.message);
    }

    return res.data;
  };

  const register = async (name, email, password, role, phone) => {
    const res = await api.post('/auth/register', { name, email, password, role, phone });
    const { token: userToken, user: userData } = res.data;

    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);

    // Fetch wishlist after registration
    try {
      const wishRes = await api.get('/wishlist');
      setWishlist(wishRes.data.map(item => item._id));
    } catch (err) {
      console.error('Failed to load wishlist on register:', err.message);
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWishlist([]);
  };

  // Show Auth Modal Trigger
  const showAuthModal = (mode = 'login', callback = null, customContent = null) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setPendingAction(() => callback);
    setAuthModalCustomContent(customContent);
  };

  // Close Auth Modal Trigger
  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPendingAction(null);
    setAuthModalCustomContent(null);
  };

  // Handle successful auth completion
  const handleAuthSuccess = (userData) => {
    setAuthModalOpen(false);
    if (pendingAction) {
      // Execute the pending action callback after a tiny timeout to prevent state conflicts
      setTimeout(() => {
        pendingAction(userData);
      }, 100);
    }
    setPendingAction(null);
    setAuthModalCustomContent(null);
  };

  const toggleWishlist = async (listingId) => {
    // If user is not authenticated, trigger the global auth modal
    if (!token) {
      showAuthModal('login', async () => {
        const freshToken = localStorage.getItem('token');
        try {
          await api.post(`/wishlist/${listingId}`, {}, {
            headers: { Authorization: `Bearer ${freshToken}` }
          });
          setWishlist(prev => [...prev, listingId]);
        } catch (err) {
          console.error('Failed to toggle wishlist after auth:', err.message);
        }
      }, {
        title: 'Save to Wishlist',
        description: 'Log in or sign up to add this vehicle to your wishlist and track price changes.'
      });
      return;
    }

    const isSaved = wishlist.includes(listingId);
    try {
      if (isSaved) {
        await api.delete(`/wishlist/${listingId}`);
        setWishlist(prev => prev.filter(id => id !== listingId));
      } else {
        await api.post(`/wishlist/${listingId}`);
        setWishlist(prev => [...prev, listingId]);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      wishlist, 
      toggleWishlist,
      showAuthModal,
      closeAuthModal,
      authModalCustomContent
    }}>
      {children}
      {authModalOpen && (
        <AuthModal
          mode={authModalMode}
          onClose={closeAuthModal}
          onSuccess={handleAuthSuccess}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
