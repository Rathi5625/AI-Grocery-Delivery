import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { pageVariants } from './utils/animations';

import './index.css';

// ── Auth pages ──
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const VerifyOtpPage      = lazy(() => import('./pages/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetLinkSentPage  = lazy(() => import('./pages/ResetLinkSentPage'));

// ── Main pages ──
const HomePage             = lazy(() => import('./pages/HomePage'));
const ShopPage             = lazy(() => import('./pages/ShopPage'));
const ProductListPage      = lazy(() => import('./pages/ProductListPage'));
const ProductDetailsPage   = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage             = lazy(() => import('./pages/CartPage'));
const CheckoutPage         = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage     = lazy(() => import('./pages/OrderSuccessPage'));
const ProfilePage          = lazy(() => import('./pages/ProfilePage'));
const OrdersPage           = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailsPage     = lazy(() => import('./pages/OrderDetailsPage'));

// ── Admin pages ──
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard'));
const AdminProductsPage   = lazy(() => import('./pages/AdminProductsPage'));
const AdminOrdersPage     = lazy(() => import('./pages/AdminOrdersPage'));
const AdminUsersPage      = lazy(() => import('./pages/AdminUsersPage'));
const AdminInventoryPage  = lazy(() => import('./pages/AdminInventoryPage'));

// ── Page Transition Wrapper ──
function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex-grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}

// ── Loading Skeleton (Global) ──
function GlobalLoading() {
  return (
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#D6B588]/30 border-t-[#422701] rounded-full animate-spin"></div>
        <p className="text-[#422701] font-medium tracking-wide">Loading FreshAI...</p>
      </div>
    </div>
  );
}


import './index.css';

// ── Route Guards ───────────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

// ── App Shell (Navbar + Footer wrapper) ──────────────────────
function AppLayout({ children, showNav = true, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNav && <Navbar />}
      <main className="flex-grow flex flex-col">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

// ── Animated Routes ────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<GlobalLoading />}>
        <Routes location={location} key={location.pathname}>

          {/* ── Auth pages (no nav/footer) ── */}
          <Route path="/login"             element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register"          element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route path="/verify-otp"        element={<PageTransition><VerifyOtpPage /></PageTransition>} />
          <Route path="/forgot-password"   element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
          <Route path="/reset-link-sent"   element={<PageTransition><ResetLinkSentPage /></PageTransition>} />

          {/* ── Admin pages (no footer) ── */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition><AdminDashboard /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition><AdminProductsPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition><AdminOrdersPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition><AdminUsersPage /></PageTransition>
            </ProtectedRoute>
          } />
          <Route path="/admin/inventory" element={
            <ProtectedRoute adminOnly={true}>
              <PageTransition><AdminInventoryPage /></PageTransition>
            </ProtectedRoute>
          } />

          {/* ── Main pages ── */}
          <Route path="/"             element={<AppLayout><PageTransition><HomePage /></PageTransition></AppLayout>} />
          <Route path="/shop"         element={<AppLayout><PageTransition><ShopPage /></PageTransition></AppLayout>} />
          <Route path="/products"     element={<AppLayout><PageTransition><ProductListPage /></PageTransition></AppLayout>} />
          <Route path="/products/:id" element={<AppLayout><PageTransition><ProductDetailsPage /></PageTransition></AppLayout>} />
          <Route path="/cart"         element={<AppLayout showFooter={false}><PageTransition><CartPage /></PageTransition></AppLayout>} />
          <Route path="/checkout"     element={<AppLayout showFooter={false}><PageTransition><CheckoutPage /></PageTransition></AppLayout>} />
          <Route path="/order-success" element={<AppLayout showFooter={false}><PageTransition><OrderSuccessPage /></PageTransition></AppLayout>} />
          
          {/* ── User Profile & Orders ── */}
          <Route path="/profile"      element={
            <ProtectedRoute>
              <AppLayout><PageTransition><ProfilePage /></PageTransition></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <AppLayout><PageTransition><OrdersPage /></PageTransition></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <AppLayout><PageTransition><OrderDetailsPage /></PageTransition></AppLayout>
            </ProtectedRoute>
          } />

          {/* ── 404 fallback ── */}
          <Route path="*" element={
            <AppLayout>
              <PageTransition>
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="text-8xl mb-6">🥬</div>
                  <h1 className="text-4xl font-bold text-[#422701] mb-2">Page not found</h1>
                  <p className="text-[#705E46] mb-8 max-w-md">
                    Looks like this page went out of stock or moved to a different aisle.
                  </p>
                  <a href="/" className="px-8 py-3 bg-[#422701] text-[#D6B588] rounded-xl font-bold hover:opacity-90 transition-all">
                    Return to Home
                  </a>
                </div>
              </PageTransition>
            </AppLayout>
          } />

        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

// ── Root App ───────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              gutter={8}
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '16px',
                  background: '#422701',
                  color: '#D6B588',
                  fontSize: '0.95rem',
                  padding: '12px 24px',
                  fontWeight: 600,
                  boxShadow: '0 12px 30px rgba(66, 39, 1, 0.2)',
                  border: '1px solid rgba(214, 181, 136, 0.2)',
                },
                success: { 
                  iconTheme: { primary: '#D6B588', secondary: '#422701' },
                  style: { background: '#422701', color: '#D6B588' } 
                },
                error: { 
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                  style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } 
                },
              }}
            />
            <AnimatedRoutes />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

