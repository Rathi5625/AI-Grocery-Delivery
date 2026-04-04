import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const { cart, itemCount, totalAmount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState('');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/products?q=${encodeURIComponent(search.trim())}`);
            setSearch('');
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="main-navbar">
            <div className="navbar__inner">
                {/* Logo */}
                <Link to="/" className="navbar__logo">
                    <span className="navbar__logo-icon"><RiLeafLine /></span>
                    FreshAI
                </Link>

                {/* Location Indicator */}
                <div className="navbar__location">
                    <span>Delivery in</span>
                    <strong>10 minutes <FiChevronDown size={12} /></strong>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="navbar__search">
                    <FiSearch size={16} />
                    <input
                        type="text"
                        placeholder='Search "organic vegetables"'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        id="search-input"
                    />
                </form>

                {/* Actions */}
                <div className="navbar__actions">
                    <div className="navbar__links">
                        <Link to="/" className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}>Home</Link>
                        <Link to="/products" className={`navbar__link ${isActive('/products') ? 'navbar__link--active' : ''}`}>Shop</Link>
                    </div>

                    {isAuthenticated ? (
                        <>
                            <Link to="/cart" className="navbar__cart-btn" id="cart-btn">
                                <FiShoppingCart size={16} />
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={itemCount}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.5, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    >
                                        {itemCount > 0 ? `₹${parseFloat(totalAmount || 0).toFixed(0)}` : 'Cart'}
                                    </motion.span>
                                </AnimatePresence>
                                {itemCount > 0 && (
                                    <motion.span
                                        className="navbar__cart-badge"
                                        key={`badge-${itemCount}`}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                    >
                                        {itemCount}
                                    </motion.span>
                                )}
                            </Link>

                            <Link to="/profile" className="navbar__user-btn">
                                <FiUser size={15} /> {user?.firstName}
                            </Link>
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin" className="btn btn--xs btn--outline">Admin</Link>
                            )}
                            <button onClick={logout} className="navbar__user-btn" title="Logout" style={{ padding: '6px 8px' }}>
                                <FiLogOut size={15} />
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn--primary btn--sm" id="login-btn">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
