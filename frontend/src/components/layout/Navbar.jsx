import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiUser, FiLogOut,
  FiChevronDown, FiPackage, FiSettings, FiX,
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
    <nav className={`nav2 ${scrolled ? 'nav2--scrolled' : ''}`} id="main-navbar">
      <div className="nav2__inner">

        {/* ── Logo ── */}
        <Link to="/" className="nav2__logo" id="nav-logo">
          <span className="nav2__logo-icon"><RiLeafLine size={16} /></span>
          <span>FreshAI</span>
        </Link>

        {/* ── Search bar (desktop) ── */}
        <form onSubmit={handleSearch} className="nav2__search" role="search">
          <FiSearch size={15} className="nav2__search-icon" />
          <input
            type="search"
            placeholder='Search fresh groceries…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
            aria-label="Search products"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="nav2__search-clear" aria-label="Clear">
              <FiX size={13} />
            </button>
          )}
        </form>

        {/* ── Right actions ── */}
        <div className="nav2__actions">
          <div className="nav2__links">
            <Link to="/" className={`nav2__link ${isActive('/') ? 'nav2__link--active' : ''}`}>Home</Link>
            <Link to="/products" className={`nav2__link ${isActive('/products') ? 'nav2__link--active' : ''}`}>Shop</Link>
          </div>

          {/* Mobile search toggle */}
          <button
            className="nav2__icon-btn nav2__mobile-search-toggle"
            onClick={() => setMobileSearch(s => !s)}
            aria-label="Toggle search"
          >
            {mobileSearch ? <FiX size={18} /> : <FiSearch size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <Link to="/cart" className="nav2__cart" id="cart-btn" aria-label="Cart">
                <FiShoppingCart size={16} />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="nav2__cart-label"
                  >
                    {itemCount > 0 ? `₹${parseFloat(totalAmount || 0).toFixed(0)}` : 'Cart'}
                  </motion.span>
                </AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key={`b-${itemCount}`}
                    className="nav2__cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="nav2__user-wrap" ref={dropRef}>
                <button
                  className="nav2__user-btn"
                  id="user-menu-btn"
                  onClick={() => setDropOpen(o => !o)}
                  aria-expanded={dropOpen}
                >
                  <span className="nav2__avatar">{initials}</span>
                  <span className="nav2__user-name">{user?.firstName}</span>
                  <FiChevronDown
                    size={13}
                    style={{ transition: 'transform .2s', transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                  />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      className="nav2__dropdown"
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                    >
                      <div className="nav2__drop-header">
                        <div className="nav2__drop-avatar">{initials}</div>
                        <div>
                          <div className="nav2__drop-name">{user?.firstName} {user?.lastName}</div>
                          <div className="nav2__drop-email">{user?.email}</div>
                        </div>
                      </div>
                      <div className="nav2__drop-divider" />
                      <Link to="/profile" className="nav2__drop-item" id="profile-link"><FiUser size={14} /> My Profile</Link>
                      <Link to="/cart"    className="nav2__drop-item" id="orders-link"> <FiPackage size={14} /> My Orders</Link>
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" className="nav2__drop-item" id="admin-link"><FiSettings size={14} /> Admin Panel</Link>
                      )}
                      <div className="nav2__drop-divider" />
                      <button className="nav2__drop-item nav2__drop-item--danger" onClick={logout} id="logout-btn">
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login" className="nav2__signin-btn" id="login-btn">Sign In</Link>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            className="nav2__mobile-search-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, padding: '10px 16px' }}>
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
