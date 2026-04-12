import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiPlus, FiCheck, FiShoppingCart } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export default function ProductCard({ product, onAddToCart, index = 0 }) {
  const hasDiscount  = product.discountPrice && product.discountPrice < product.price;
  const discountPct  = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  const [added, setAdded]       = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;
    setAdded(true);
    await onAddToCart?.(product.id);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div
      className="product-card"
      id={`product-${product.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.05, 0.4), ease: [0.4, 0, 0.2, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.14)' }}
    >
      {/* ── Image ── */}
      <Link to={`/products/${product.id}`} tabIndex={-1}>
        <div className="product-card__image-wrap" style={{ position: 'relative', width: '100%', paddingTop: '100%', overflow: 'hidden' }}>
          {imgError || !product.imageUrl ? (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
              <RiLeafLine size={48} opacity={0.3} />
            </div>
          ) : (
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              className="product-card__image"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
              onError={() => setImgError(true)}
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )}

          {/* Gradient overlay */}
          <div className="product-card__image-overlay" />

          {/* Badges */}
          <div className="product-card__badges">
            {hasDiscount && (
              <span className="product-card__badge product-card__badge--sale">
                {discountPct}% OFF
              </span>
            )}
            {product.isOrganic && (
              <span className="product-card__badge product-card__badge--organic">
                <RiLeafLine size={9} /> Organic
              </span>
            )}
            {product.isFeatured && !hasDiscount && !product.isOrganic && (
              <span className="product-card__badge product-card__badge--featured">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Eco score */}
          {product.sustainabilityScore && (
            <div className="product-card__eco-score" title={`Eco Score: ${product.sustainabilityScore}/10`}>
              <RiLeafLine size={10} />
              {Number(product.sustainabilityScore).toFixed(1)}
            </div>
          )}

          {/* Quick-add overlay button (visible on hover) */}
          <AnimatePresence>
            {hovered && (
              <motion.button
                className={`product-card__add-btn ${added ? 'product-card__add-btn--added' : ''}`}
                onClick={handleAdd}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                whileTap={{ scale: 0.88 }}
                id={`quick-add-${product.id}`}
                aria-label={`Add ${product.name} to cart`}
              >
                {added ? <FiCheck size={15} /> : <FiShoppingCart size={15} />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="product-card__body">
        <div className="product-card__timer">⚡ 10 min delivery</div>

        <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <div className="product-card__weight">{product.unit}</div>

        <div className="product-card__bottom">
          <div className="product-card__prices">
            <span className="product-card__price">₹{displayPrice}</span>
            {hasDiscount && (
              <span className="product-card__original-price">₹{product.price}</span>
            )}
          </div>

          {/* Inline add button */}
          <motion.button
            className={`product-card__inline-add ${added ? 'product-card__inline-add--added' : ''}`}
            onClick={handleAdd}
            whileTap={{ scale: 0.92 }}
            id={`add-to-cart-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <FiCheck size={12} /> ADDED
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  <FiPlus size={12} /> ADD
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
