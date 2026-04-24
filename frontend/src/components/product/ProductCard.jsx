import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiPlus, FiCheck, FiShoppingCart, FiZap } from 'react-icons/fi';
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
      className="pcard"
      id={`product-${product.id}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: Math.min(index * 0.05, 0.4), ease: [0.4, 0, 0.2, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
    >
      {/* ── Image ── */}
      <Link to={`/products/${product.id}`} tabIndex={-1} className="pcard__img-link">
        <div className="pcard__img-wrap">
          {imgError || !product.imageUrl ? (
            <div className="pcard__img-fallback">
              <RiLeafLine size={44} opacity={0.2} />
            </div>
          ) : (
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              className="pcard__img"
              loading="lazy"
              onError={() => setImgError(true)}
              animate={{ scale: hovered ? 1.08 : 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          )}

          {/* gradient overlay */}
          <div className="pcard__img-overlay" />

          {/* Badges */}
          <div className="pcard__badges">
            {hasDiscount && (
              <span className="pcard__badge pcard__badge--sale">{discountPct}% OFF</span>
            )}
            {product.isOrganic && (
              <span className="pcard__badge pcard__badge--organic">
                <RiLeafLine size={9} /> Organic
              </span>
            )}
          </div>

          {/* Delivery pill */}
          <div className="pcard__delivery-pill">
            <FiZap size={9} />
            <span>10 min</span>
          </div>

          {/* Eco score */}
          {product.sustainabilityScore && (
            <div className="pcard__eco" title={`Eco Score: ${product.sustainabilityScore}/10`}>
              <RiLeafLine size={10} />
              {Number(product.sustainabilityScore).toFixed(1)}
            </div>
          )}

          {/* Quick-add overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.button
                className={`pcard__quick-add ${added ? 'pcard__quick-add--added' : ''}`}
                onClick={handleAdd}
                initial={{ opacity: 0, scale: 0.75, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.75, y: 6 }}
                transition={{ duration: 0.18 }}
                whileTap={{ scale: 0.9 }}
                id={`quick-add-${product.id}`}
                aria-label={`Add ${product.name} to cart`}
              >
                {added ? <FiCheck size={14} /> : <FiShoppingCart size={14} />}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* ── Body ── */}
      <div className="pcard__body">
        <Link to={`/products/${product.id}`} className="pcard__name-link">
          <h3 className="pcard__name">{product.name}</h3>
        </Link>
        <div className="pcard__unit">{product.unit}</div>

        <div className="pcard__bottom">
          <div className="pcard__prices">
            <span className="pcard__price">₹{displayPrice}</span>
            {hasDiscount && (
              <span className="pcard__original">₹{product.price}</span>
            )}
          </div>

          <motion.button
            className={`pcard__add ${added ? 'pcard__add--added' : ''}`}
            onClick={handleAdd}
            whileTap={{ scale: 0.9 }}
            id={`add-to-cart-${product.id}`}
            aria-label={`Add ${product.name} to cart`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="added"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  <FiCheck size={12} /> ✓
                </motion.span>
              ) : (
                <motion.span key="add"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  <FiPlus size={12} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
