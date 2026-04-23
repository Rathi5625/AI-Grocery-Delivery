import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import UserProfilePage from './pages/UserProfilePage';
import './index.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) return null; // Avoid redirecting while checking auth status
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  
  return children;
}
function AppLayout({ children, showNav = true, showFooter = true }) {
  return (
    <>
      {showNav && <Navbar />}
      <div className="page-wrapper">{children}</div>
      {showFooter && <Footer />}
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Auth pages (no layout) ── */}
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/verify-otp"       element={<VerifyOtpPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />} />

        {/* ── Admin (no footer) ── */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AppLayout showFooter={false}><AdminDashboard /></AppLayout>
          </ProtectedRoute>
        } />

        {/* ── Main pages ── */}
        <Route path="/"              element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/products"      element={<AppLayout><ProductListPage /></AppLayout>} />
        <Route path="/products/:id"  element={<AppLayout><ProductDetailPage /></AppLayout>} />
        <Route path="/cart"          element={<AppLayout><CartPage /></AppLayout>} />
        <Route path="/checkout"      element={<AppLayout><CheckoutPage /></AppLayout>} />
        <Route path="/order-success" element={<AppLayout><OrderSuccessPage /></AppLayout>} />
        <Route path="/profile"       element={<AppLayout><UserProfilePage /></AppLayout>} />

        {/* ── 404 fallback ── */}
        <Route path="*" element={
          <AppLayout>
            <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
              <div style={{ fontSize: '5rem' }}>🥬</div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0 0.5rem' }}>Page not found</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Looks like this page went out of stock.
              </p>
              <a href="/" className="btn btn--primary">Go Home</a>
            </div>
          </AppLayout>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
              duration: 2500,
              style: {
                borderRadius: '12px',
                background: '#1f2937',
                color: '#fff',
                fontSize: '0.875rem',
                padding: '10px 18px',
                fontWeight: 500,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              },
              success: { iconTheme: { primary: '#10b77f', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <AnimatedRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
