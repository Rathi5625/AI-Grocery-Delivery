import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
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
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

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
        {/* Auth — No Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AppLayout showFooter={false}><AdminDashboard /></AppLayout>} />

        {/* Main Pages */}
        <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />
        <Route path="/products" element={<AppLayout><ProductListPage /></AppLayout>} />
        <Route path="/products/:id" element={<AppLayout><ProductDetailPage /></AppLayout>} />
        <Route path="/cart" element={<AppLayout><CartPage /></AppLayout>} />
        <Route path="/checkout" element={<AppLayout><CheckoutPage /></AppLayout>} />
        <Route path="/order-success" element={<AppLayout><OrderSuccessPage /></AppLayout>} />
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
              success: {
                iconTheme: { primary: '#10b77f', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
          <AnimatedRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
