import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts, getCategories } from '../api/productApi';
import ProductCard from '../components/product/ProductCard';
import { ProductSkeleton } from '../components/common/Skeleton';
import { staggerContainer, fadeInScale, hoverLift } from '../utils/animations';
import toast from 'react-hot-toast';
import { FiArrowRight, FiShield, FiTruck, FiZap } from 'react-icons/fi';

export default function HomePage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts(0, 4),
          getCategories()
        ]);
        
        const pageData = prodRes.data;
        const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : []);
        setProducts(content.slice(0, 4));
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in first');
      navigate('/login');
      return;
    }
    try {
      await addItem(productId, 1);
      toast.success('Added to cart! 🛒');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="w-full bg-[#FAF7F2] font-sans pb-20 overflow-x-hidden">
      {/* ── Hero Section ── */}
      <section className="relative px-4 md:px-8 max-w-[1440px] mx-auto pt-6 mb-20">
        <div className="relative w-full rounded-[2rem] overflow-hidden bg-[#422701] min-h-[500px] md:min-h-[650px] flex items-center px-8 md:px-20">
          {/* Parallax Background */}
          <motion.div 
            style={{ y: y1 }}
            className="absolute inset-0 z-0"
          >
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
              alt="Hero background" 
              className="w-full h-full object-cover opacity-60 scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#422701]/90 via-[#422701]/40 to-transparent"></div>
          </motion.div>

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block text-[#D6B588] tracking-[0.2em] text-xs font-bold mb-6 uppercase border-b border-[#D6B588]/30 pb-1">
                FreshAI Premium Experience
              </span>
              <h1 className="text-white text-5xl md:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
                Curating the <br />
                <span className="text-[#D6B588]">Finest Organics</span> <br />
                Just for You.
              </h1>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/shop" 
                  className="group relative overflow-hidden bg-[#D6B588] text-[#422701] px-10 py-4 rounded-xl font-bold text-sm tracking-wide shadow-xl hover:shadow-[#D6B588]/20 transition-all flex items-center gap-2"
                >
                  <span className="relative z-10">START SHOPPING</span>
                  <FiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </Link>
                <Link 
                  to="/shop" 
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-white/20 transition-all"
                >
                  HOW IT WORKS
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Floating Glassmorphism Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="absolute right-10 bottom-10 hidden lg:block"
          >
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 text-white w-[300px] shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#D6B588] flex items-center justify-center text-[#422701]">
                  <FiZap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">AI Smart Cart</h4>
                  <p className="text-xs text-white/60 uppercase tracking-widest">Active Now</p>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Our AI has already saved you <span className="text-[#D6B588] font-bold">12 mins</span> by pre-selecting your favorites.
              </p>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  transition={{ delay: 1.2, duration: 1.5 }}
                  className="h-full bg-[#D6B588]"
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Row ── */}
      <section className="px-4 md:px-8 max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {[
          { icon: FiShield, title: "Farm to Table", desc: "100% verified organic sourcing from local boutique farms." },
          { icon: FiTruck, title: "Carbon Neutral", desc: "Every delivery is offset by our reforestation initiatives." },
          { icon: FiZap, title: "AI Personalized", desc: "Smarter selections that learn your unique taste profile." }
        ].map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-5 p-6 rounded-2xl border border-[#C6C0B9]/20 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#422701] flex items-center justify-center shrink-0 border border-[#C6C0B9]/20">
              <f.icon size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#422701] mb-1">{f.title}</h3>
              <p className="text-sm text-[#705E46] leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* ── Shop by Category ── */}
      <section className="px-4 md:px-8 max-w-[1440px] mx-auto mb-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-[#422701] mb-2 tracking-tight">Curated Categories</h2>
            <p className="text-[#705E46]">Explore the freshest picks from our specialty sections.</p>
          </div>
          <Link to="/shop" className="group flex items-center gap-2 text-sm font-bold text-[#422701] hover:text-[#D6B588] transition-colors">
            VIEW ALL <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {categories.slice(0, 6).map((cat) => (
            <motion.div key={cat.id} variants={fadeInScale}>
              <Link to={`/shop?category=${cat.id}`} className="flex flex-col items-center group">
                <motion.div 
                  variants={hoverLift}
                  whileHover="whileHover"
                  className="w-full aspect-square bg-white rounded-[2rem] overflow-hidden mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#C6C0B9]/10"
                >
                  <img 
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&q=80'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </motion.div>
                <span className="text-[13px] text-[#422701] font-bold tracking-wide uppercase">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
          {loading && Array.from({length: 6}).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="w-full aspect-square bg-[#EAE5DA]/50 rounded-[2rem] mb-4"></div>
              <div className="h-4 bg-[#EAE5DA]/50 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Trending Section ── */}
      <section className="px-4 md:px-8 max-w-[1440px] mx-auto mb-24">
        <div className="bg-[#422701] rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          {/* Decoration */}
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-[#D6B588]/10 rounded-full blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Trending This Week</h2>
              <p className="text-white/60 max-w-md">Our community's most-loved organic essentials, curated by our AI algorithms.</p>
            </div>
            <Link to="/shop" className="bg-[#D6B588] text-[#422701] px-8 py-3 rounded-xl font-bold text-sm tracking-wide hover:scale-105 transition-transform">
              EXPLORE FULL SHOP
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {products.map(product => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <ProductCard product={product} onAdd={() => handleAddToCart(product.id)} />
              </motion.div>
            ))}
            {loading && Array.from({length: 4}).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-4 md:px-8 max-w-[1440px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#D6B588] rounded-[2.5rem] p-12 md:p-20 flex flex-col items-center text-center shadow-2xl shadow-[#D6B588]/20"
        >
          <div className="w-20 h-20 rounded-full bg-[#422701] text-[#D6B588] flex items-center justify-center mb-8 shadow-xl">
            <FiZap size={36} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#422701] mb-6 tracking-tight max-w-2xl">
            Ready for a Smarter, Fresher Pantry?
          </h2>
          <p className="text-[#422701]/70 text-lg mb-10 max-w-xl leading-relaxed">
            Join 20,000+ happy families who trust FreshAI for their weekly organic curations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-[#422701] text-white px-12 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform">
              GET STARTED FREE
            </Link>
            <Link to="/shop" className="bg-transparent border-2 border-[#422701]/20 text-[#422701] px-12 py-4 rounded-xl font-bold text-lg hover:bg-[#422701]/5 transition-colors">
              BROWSE CATALOG
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
