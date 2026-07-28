import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Inquiries from './pages/Inquiries';
import MyListings from './pages/MyListings';
import AdminPanel from './pages/AdminPanel';
import Browse from './pages/Browse';
import Wishlist from './pages/Wishlist';
import Compare from './pages/Compare';
import ComingSoon from './pages/ComingSoon';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

const AppLayout = () => {
  const location = useLocation();
  const hideNavFooter = ['/login', '/register', '/forgot-password'].includes(location.pathname) || location.pathname.startsWith('/reset-password');

  return (
    <div className="w-full min-h-screen bg-background flex flex-col">
      <ScrollToTop />
      {!hideNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/edit-listing/:id" element={<EditListing />} />
        <Route path="/inquiries" element={<Inquiries />} />
        <Route path="/inquiries/:id" element={<Inquiries />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Stub/Placeholder Routes */}
        <Route path="/about" element={<ComingSoon />} />
        <Route path="/finance" element={<ComingSoon />} />
        <Route path="/faq" element={<ComingSoon />} />
        <Route path="/privacy" element={<ComingSoon />} />
        <Route path="/contact" element={<ComingSoon />} />
        <Route path="*" element={<ComingSoon />} />
      </Routes>
      {!hideNavFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <CompareProvider>
          <AppLayout />
        </CompareProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
