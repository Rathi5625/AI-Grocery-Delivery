import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div>
                    <div className="footer__brand">🌿 FreshAI</div>
                    <p className="footer__desc">
                        AI-powered grocery delivery for a sustainable future. Fresh produce,
                        personalized recommendations, and eco-friendly packaging.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        {['📘', '🐦', '📸', '▶️'].map((icon, i) => (
                            <span key={i} style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.06)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer' }}>
                                {icon}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="footer__title">Shop</h4>
                    <Link to="/products" className="footer__link">All Products</Link>
                    <Link to="/products?featured=true" className="footer__link">Today's Deals</Link>
                    <Link to="/products" className="footer__link">Organic</Link>
                    <Link to="/products" className="footer__link">Local Farms</Link>
                </div>
                <div>
                    <h4 className="footer__title">Account</h4>
                    <Link to="/login" className="footer__link">Sign In</Link>
                    <Link to="/register" className="footer__link">Create Account</Link>
                    <Link to="/cart" className="footer__link">My Cart</Link>
                    <Link to="/profile" className="footer__link">Order History</Link>
                </div>
                <div>
                    <h4 className="footer__title">Sustainability</h4>
                    <a href="#" className="footer__link">Our Mission</a>
                    <a href="#" className="footer__link">Carbon Tracking</a>
                    <a href="#" className="footer__link">Eco Packaging</a>
                    <a href="#" className="footer__link">Local Sourcing</a>
                </div>
            </div>
            <div className="footer__bottom">
                <span>© 2026 FreshAI Inc. All rights reserved.</span>
                <span>Privacy · Terms · Sustainability</span>
            </div>
        </footer>
    );
}
