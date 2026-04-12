import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiUser, FiLogOut,
  FiChevronDown, FiPackage, FiSettings, FiShield,
} from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount, totalAmount } = useCart();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [search, setSearch]         = useState('');
  const [scrolled, setScrolled]     = useState(false);
  const [dropOpen, setDropOpen]     = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const dropRef = useRef(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close dropdown on route change */
  useEffect(() => { setDropOpen(false); setMobileSearch(false); }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMobileSearch(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      id="main-navbar"
    >
      <div className="navbar__inner">
        {/* ── Logo ── */}
        <Link to="/" className="navbar__logo" id="nav-logo">
          <span className="navbar__logo-icon"><RiLeafLine /></span>
          FreshAI
        </Link>

        {/* ── Location pill ── */}
        <div className="navbar__location">
          <span>Delivery in</span>
          <strong>10 min <FiChevronDown size={11} /></strong>
        </div>

        {/* ── Search bar (desktop) ── */}
        <form onSubmit={handleSearch} className="navbar__search" role="search">
          <FiSearch size={15} className="navbar__search-icon" />
          <input
            type="search"
            placeholder='Search "organic vegetables"…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
            aria-label="Search products"
          />
        </form>

        {/* ── Actions ── */}
        <div className="navbar__actions">
          {/* Nav links */}
          <div className="navbar__links">
            <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>
              Home
            </Link>
            <Link to="/products" className={`navbar__link ${isActive('/products') ? 'navbar__link--active' : ''}`}>
              Shop
            </Link>
          </div>

          {/* Mobile search toggle */}
          <button
            className="navbar__icon-btn navbar__mobile-search"
            onClick={() => setMobileSearch(s => !s)}
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>

          {isAuthenticated ? (
            <>
              {/* ── Cart ── */}
              <Link to="/cart" className="navbar__cart-btn" id="cart-btn" aria-label="Cart">
                <FiShoppingCart size={17} />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className="navbar__cart-label"
                  >
                    {itemCount > 0 ? `₹${parseFloat(totalAmount || 0).toFixed(0)}` : 'Cart'}
                  </motion.span>
                </AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={`badge-${itemCount}`}
                    className="navbar__cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* ── User dropdown ── */}
              <div className="navbar__user-wrap" ref={dropRef}>
                <button
                  className="navbar__user-btn"
                  id="user-menu-btn"
                  onClick={() => setDropOpen(o => !o)}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                >
                  <span className="navbar__avatar">{initials}</span>
                  <span className="navbar__user-name">{user?.firstName}</span>
                  <FiChevronDown
                    size={13}
                    style={{ transition: 'transform .2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      className="navbar__dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      <div className="navbar__dropdown-header">
                        <div className="navbar__dropdown-avatar">{initials}</div>
                        <div>
                          <div className="navbar__dropdown-name">{user?.firstName} {user?.lastName}</div>
                          <div className="navbar__dropdown-email">{user?.email}</div>
                        </div>
                      </div>
                      <div className="navbar__dropdown-divider" />
                      <Link to="/profile" className="navbar__dropdown-item" id="profile-link">
                        <FiUser size={14} /> My Profile
                      </Link>
                      <Link to="/cart" className="navbar__dropdown-item" id="cart-dropdown-link">
                        <FiPackage size={14} /> My Orders
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="navbar__dropdown-item" id="admin-link">
                          <FiSettings size={14} /> Admin Panel
                        </Link>
                      )}
                      <div className="navbar__dropdown-divider" />
                      <button
                        className="navbar__dropdown-item navbar__dropdown-item--danger"
                        onClick={logout}
                        id="logout-btn"
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm" id="login-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* ── Mobile search bar ── */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            className="navbar__mobile-search-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
              <input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
                autoFocus
                id="mobile-search-input"
              />
              <button type="submit" className="btn btn--primary btn--sm">Go</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
