import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { loadFeaturedProducts, loadCategories } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';
import {
  FiArrowRight, FiZap, FiTruck, FiShield, FiClock,
  FiStar, FiCheck, FiDroplet, FiPackage, FiSmartphone,
  FiSearch,
} from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

/* ── Static data ── */
const CATEGORY_CONFIG = [
  { emoji: '🍎', name: 'Fruits',      color: '#ef4444', bg: '#fef2f2', slug: 'fruits'     },
  { emoji: '🥦', name: 'Vegetables',  color: '#22c55e', bg: '#f0fdf4', slug: 'vegetables' },
  { emoji: '🥛', name: 'Dairy',       color: '#3b82f6', bg: '#eff6ff', slug: 'dairy'      },
  { emoji: '🍿', name: 'Snacks',      color: '#f59e0b', bg: '#fffbeb', slug: 'snacks'     },
  { emoji: '☕', name: 'Beverages',   color: '#8b5cf6', bg: '#f5f3ff', slug: 'beverages'  },
  { emoji: '🧹', name: 'Household',   color: '#06b6d4', bg: '#ecfeff', slug: 'household'  },
  { emoji: '🍞', name: 'Bakery',      color: '#d97706', bg: '#fef3c7', slug: 'bakery'     },
  { emoji: '🧊', name: 'Frozen',      color: '#6366f1', bg: '#eef2ff', slug: 'frozen-foods'},
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',  city: 'Mumbai',    rating: 5, text: 'FreshAI is a game-changer! Groceries arrive in 8 minutes and produce quality beats every supermarket nearby.', avatar: 'PS', color: '#6366f1', tag: 'Regular Customer' },
  { name: 'Rahul Verma',   city: 'Pune',      rating: 5, text: 'The AI recommendations are uncanny — it suggested Alphonso mangoes just as the season started. The app just gets me.', avatar: 'RV', color: '#10b981', tag: 'Premium Member' },
  { name: 'Ananya Iyer',   city: 'Bengaluru', rating: 5, text: 'I love that every order shows the carbon footprint saved. It makes grocery shopping feel meaningful.', avatar: 'AI', color: '#f59e0b', tag: 'Eco Champion' },
  { name: 'Karan Mehta',   city: 'Delhi',     rating: 5, text: 'Switched from Blinkit to FreshAI and never looked back. Better quality, same speed, sustainability is a big plus.', avatar: 'KM', color: '#ef4444', tag: 'Food Enthusiast' },
  { name: 'Sneha Pillai',  city: 'Chennai',   rating: 5, text: 'When my spinach wilted faster than expected, they refunded me instantly with no hassle. Freshness promise is real!', avatar: 'SP', color: '#3b82f6', tag: 'Verified Buyer' },
  { name: 'Amit Joshi',    city: 'Hyderabad', rating: 5, text: 'Running a home bakery, I rely on FreshAI for daily dairy and produce. Consistent quality saves me so much time.', avatar: 'AJ', color: '#8b5cf6', tag: 'Business User' },
];

const BENEFITS = [
  { icon: '⚡', title: '10-Min Delivery', desc: 'Hyper-local dark stores ensure groceries reach you while still fresh.', color: '#f59e0b' },
  { icon: '🤖', title: 'AI-Curated Picks', desc: 'Our AI learns your preferences and surfaces the best seasonal items.', color: '#6366f1' },
  { icon: '🌱', title: 'Eco Packaging', desc: '100% compostable packaging. We offset the carbon footprint of every delivery.', color: '#10b981' },
  { icon: '💯', title: 'Freshness Guarantee', desc: "Don't love it? Instant replacement or full refund — no questions asked.", color: '#ef4444' },
  { icon: '🚲', title: 'Electric Fleet', desc: 'Last-mile delivery uses e-bikes and bicycles for a zero-emission neighbourhood.', color: '#3b82f6' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Bank-grade encryption, OTP-secured accounts, zero data sharing — ever.', color: '#8b5cf6' },
];

const STATS = [
  { value: '10 min', label: 'Avg. Delivery', icon: <FiClock /> },
  { value: '50K+',   label: 'Happy Customers', icon: <FiStar /> },
  { value: '12K kg', label: 'CO₂ Saved', icon: <RiLeafLine /> },
  { value: '500+',   label: 'Products', icon: <FiPackage /> },
];

/* ── Helpers ── */
function StatCard({ value, label, icon }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="hero-stat"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="hero-stat__icon">{icon}</div>
      <div className="hero-stat__value">{value}</div>
      <div className="hero-stat__label">{label}</div>
    </motion.div>
  );
}

/* ── Main Component ── */
export default function HomePage() {
  const [featured, setFeatured]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const { addItem }                 = useCart();
  const { isAuthenticated }         = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [featData, catData] = await Promise.all([
          loadFeaturedProducts(),
          loadCategories(),
        ]);
        setFeatured(featData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error('HomePage load error:', err);
        toast.error(err.userMessage || 'Backend not reachable — start on port 8080');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAdd = async (productId) => {
    if (!isAuthenticated) { toast.error('Please sign in to add items'); return; }
    try {
      await addItem(productId, 1);
      toast.success('Added to cart! 🛒');
    } catch { toast.error('Failed to add'); }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/products?q=${encodeURIComponent(heroSearch.trim())}`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ════════════ HERO ════════════ */}
      <section className="lp-hero" id="hero">
        {/* decorative blobs */}
        <div className="lp-hero__blob lp-hero__blob--1" />
        <div className="lp-hero__blob lp-hero__blob--2" />
        <div className="lp-hero__blob lp-hero__blob--3" />

        <div className="lp-hero__inner">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="lp-hero__eyebrow">
              <FiZap size={13} /> AI-Powered Grocery Delivery
            </span>
            <h1 className="lp-hero__title">
              Fresh groceries<br />
              <span className="lp-hero__title-accent">in 10 minutes</span>
            </h1>
            <p className="lp-hero__subtitle">
              Farm-fresh produce, AI-curated picks, and eco-friendly delivery —
              right to your doorstep before the ice melts.
            </p>

            {/* Hero search bar */}
            <form onSubmit={handleHeroSearch} className="lp-hero__search">
              <FiSearch size={18} className="lp-hero__search-icon" />
              <input
                type="text"
                placeholder='Try "organic bananas" or "Greek yogurt"…'
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                id="hero-search-input"
                aria-label="Search products"
              />
              <button type="submit" className="btn btn--primary" id="hero-search-btn">
                Search <FiArrowRight size={15} />
              </button>
            </form>

            <div className="lp-hero__actions">
              <Link to="/products" className="btn btn--primary btn--lg" id="shop-now-btn">
                Shop Now <FiArrowRight />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn--ghost btn--lg" id="join-free-btn">
                  Join Free
                </Link>
              )}
            </div>

            {/* Trust badges */}
            <div className="lp-hero__trust">
              {['✓ No hidden fees', '✓ First delivery free', '✓ Cancel anytime'].map((t) => (
                <span key={t} className="lp-hero__trust-item">{t}</span>
              ))}
            </div>
          </motion.div>

          {/* Hero image grid */}
          <motion.div
            className="lp-hero__image-grid"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="lp-hero__image-grid-inner">
              {[
                'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&q=80',
                'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
                'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
                'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&q=80',
              ].map((src, i) => (
                <motion.div
                  key={i}
                  className="lp-hero__image-card"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.04, zIndex: 10 }}
                >
                  <img src={src} alt="" loading="lazy" />
                </motion.div>
              ))}
            </div>

            {/* Floating delivery badge */}
            <motion.div
              className="lp-hero__delivery-badge"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 300, damping: 18 }}
            >
              <span className="lp-hero__delivery-badge-icon">⚡</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>10 Min</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>Delivery</div>
              </div>
            </motion.div>

            {/* Floating rating badge */}
            <motion.div
              className="lp-hero__rating-badge"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.85, type: 'spring', stiffness: 300, damping: 18 }}
            >
              <div style={{ fontWeight: 800, color: '#f59e0b' }}>★ 4.9</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>50K+ reviews</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="lp-hero__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {STATS.map((s, i) => <StatCard key={i} {...s} />)}
        </motion.div>
      </section>

      {/* ════════════ FLASH DEAL BANNER ════════════ */}
      <div className="lp-section" style={{ paddingBottom: 0 }}>
        <motion.div
          className="lp-deal-banner"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="lp-deal-banner__left">
            <span className="lp-deal-banner__tag">⚡ Flash Sale</span>
            <h3>Up to <strong>40%</strong> Off Organic Picks!</h3>
            <p>Fresh fruits, dairy & snacks at unbeatable prices</p>
            <Link to="/products" className="btn btn--primary btn--sm" id="flash-deal-btn">
              Grab the Deal <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="lp-deal-banner__timer">
            {[{ v: '06', l: 'HRS' }, { v: '23', l: 'MIN' }, { v: '41', l: 'SEC' }].map((t) => (
              <div className="lp-deal-banner__time" key={t.l}>
                <strong>{t.v}</strong>
                <span>{t.l}</span>
              </div>
            ))}
          </div>
          <div className="lp-deal-banner__image">
            <img src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200&q=80" alt="Fresh Produce" />
          </div>
        </motion.div>
      </div>

      {/* ════════════ CATEGORIES GRID ════════════ */}
      <section className="lp-section" id="categories-section">
        <div className="lp-section__header">
          <div>
            <h2 className="lp-section__title">Shop by Category</h2>
            <p className="lp-section__subtitle">Browse fresh, sustainably-sourced products</p>
          </div>
          <Link to="/products" className="lp-section__see-all" id="categories-see-all">
            See all <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="lp-category-grid">
          {(categories.length > 0 ? categories : CATEGORY_CONFIG).map((cat, i) => {
            const config = CATEGORY_CONFIG.find(c => c.slug === cat.slug || c.name === cat.name) || CATEGORY_CONFIG[i % CATEGORY_CONFIG.length];
            return (
              <motion.div
                key={cat.id || i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Link
                  to={`/products?category=${cat.id || (i + 1)}`}
                  className="lp-category-card"
                  id={`cat-${cat.slug || i}`}
                  style={{ '--cat-color': config.color, '--cat-bg': config.bg }}
                >
                  <div className="lp-category-card__emoji">{config.emoji}</div>
                  <div className="lp-category-card__name">{cat.name}</div>
                  {cat.imageUrl && (
                    <img src={cat.imageUrl + '&q=60'} alt={cat.name} className="lp-category-card__img" loading="lazy" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ════════════ FEATURED PRODUCTS ════════════ */}
      <section className="lp-section lp-section--tinted" id="featured-section">
        <div className="lp-section__header">
          <div>
            <h2 className="lp-section__title">Picked for You ✨</h2>
            <p className="lp-section__subtitle">AI-curated based on seasonal availability</p>
          </div>
          <Link to="/products" className="lp-section__see-all" id="featured-see-all">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="product-grid">
            {featured.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAdd} index={i} />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/products" className="btn btn--outline btn--lg" id="view-all-btn">
            Browse All 500+ Products <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ════════════ BENEFITS / WHY CHOOSE US ════════════ */}
      <section className="lp-section" id="why-us">
        <div className="lp-section__header" style={{ marginBottom: 40 }}>
          <div>
            <h2 className="lp-section__title">Why Choose FreshAI?</h2>
            <p className="lp-section__subtitle">Everything a modern grocery platform should be</p>
          </div>
        </div>

        <div className="lp-benefits-grid">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              className="lp-benefit-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.09, duration: 0.4 }}
              whileHover={{ y: -5, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
            >
              <div className="lp-benefit-card__icon" style={{ background: b.color + '18', color: b.color }}>
                {b.icon}
              </div>
              <h3 className="lp-benefit-card__title">{b.title}</h3>
              <p className="lp-benefit-card__desc">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════ SUSTAINABILITY BAND ════════════ */}
      <motion.section
        className="lp-sustain"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="lp-sustain__inner">
          <div className="lp-sustain__text">
            <span className="lp-sustain__tag"><RiLeafLine /> Sustainability</span>
            <h2>Every Order Makes a Difference 🌍</h2>
            <p>
              Our AI tracks carbon footprint per item, suggests eco-friendly swaps,
              and reduces food waste by matching you with products at peak freshness.
            </p>
            <div className="lp-sustain__checks">
              {['100% compostable packaging', 'Carbon-offset deliveries', 'Zero food waste goal', 'Electric delivery fleet'].map(f => (
                <div key={f} className="lp-sustain__check">
                  <FiCheck size={15} /> {f}
                </div>
              ))}
            </div>
          </div>
          <div className="lp-sustain__stats">
            {[
              { value: '12,450 kg', label: 'CO₂ Saved', icon: '🌱' },
              { value: '8,200+', label: 'Eco Deliveries', icon: '🚲' },
              { value: '95%', label: 'Fresh Guarantee', icon: '✨' },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="lp-sustain__stat"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.4 }}
              >
                <div className="lp-sustain__stat-value">{s.value}</div>
                <div className="lp-sustain__stat-label">{s.icon} {s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ════════════ TESTIMONIALS ════════════ */}
      <section className="lp-section" id="testimonials">
        <div className="lp-section__header" style={{ marginBottom: 40 }}>
          <div>
            <h2 className="lp-section__title">Loved by 50,000+ Customers</h2>
            <p className="lp-section__subtitle">Real reviews from real people who shop with FreshAI every day</p>
          </div>
        </div>

        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              className="lp-testimonial-card"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <div className="lp-testimonial-card__stars">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <FiStar key={j} size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                ))}
              </div>
              <p className="lp-testimonial-card__text">"{t.text}"</p>
              <div className="lp-testimonial-card__author">
                <div
                  className="lp-testimonial-card__avatar"
                  style={{ background: t.color + '22', color: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="lp-testimonial-card__name">{t.name}</div>
                  <div className="lp-testimonial-card__meta">{t.city} · <span>{t.tag}</span></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section className="lp-section lp-section--tinted" id="how-it-works">
        <div className="lp-section__header" style={{ marginBottom: 40 }}>
          <div>
            <h2 className="lp-section__title">How It Works</h2>
            <p className="lp-section__subtitle">Your groceries in 3 simple steps</p>
          </div>
        </div>
        <div className="lp-steps">
          {[
            { step: '01', icon: '🔍', title: 'Browse & Search', desc: 'Explore 500+ fresh products or search for exactly what you need.' },
            { step: '02', icon: '🛒', title: 'Add to Cart', desc: 'Add items to your cart and choose your preferred delivery slot.' },
            { step: '03', icon: '⚡', title: 'Get it in 10 Min', desc: 'Our hyper-local dark stores dispatch your order instantly.' },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="lp-step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.45 }}
            >
              <div className="lp-step__number">{s.step}</div>
              <div className="lp-step__icon">{s.icon}</div>
              <h3 className="lp-step__title">{s.title}</h3>
              <p className="lp-step__desc">{s.desc}</p>
              {i < 2 && <div className="lp-step__connector" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════════ CTA SECTION ════════════ */}
      <motion.section
        className="lp-cta"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="lp-cta__inner">
          <span className="lp-cta__tag">🎉 Limited Offer</span>
          <h2 className="lp-cta__title">Ready to eat fresh today?</h2>
          <p className="lp-cta__sub">
            Join 50,000+ customers who trust FreshAI for their daily groceries.
            <strong> First order: free delivery!</strong>
          </p>
          <div className="lp-cta__actions">
            <Link to="/products" className="btn btn--primary btn--lg" id="cta-shop-btn">
              Start Shopping <FiArrowRight />
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="btn btn--ghost btn--lg" id="cta-register-btn">
                Create Free Account
              </Link>
            )}
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}
