import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';
import { getProductImageUrl } from '../../utils/imageUtils';

export default function ProductCard({ product, onAddToCart, index = 0 }) {
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPct = hasDiscount
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    const [added, setAdded]       = useState(false);
    const [imgError, setImgError] = useState(false);

    // Resolve accurate image
    const imageUrl = imgError
        ? getProductImageUrl(product.name, product.categoryName, '', 400, 400)
        : (product.imageUrl || getProductImageUrl(product.name, product.categoryName, '', 400, 400));

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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
        >
            <Link to={`/products/${product.id}`}>
                <div className="product-card__image-wrap">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-card__image"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />

                    {/* Overlay gradient */}
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
                    </div>

                    {/* Eco Score */}
                    {product.sustainabilityScore && (
                        <div className="product-card__eco-score" title="Eco Score">
                            <RiLeafLine size={10} />
                            {product.sustainabilityScore}
                        </div>
                    )}

                    {/* Quick Add Overlay Button */}
                    <motion.button
                        className={`product-card__add-btn ${added ? 'product-card__add-btn--added' : ''}`}
                        onClick={handleAdd}
                        whileTap={{ scale: 0.88 }}
                        id={`add-to-cart-${product.id}`}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <AnimatePresence mode="wait">
                            {added ? (
                                <motion.span
                                    key="check"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FiCheck size={14} />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="plus"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FiPlus size={14} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </Link>

            <div className="product-card__body">
                {/* Timer / Delivery Speed */}
                <div className="product-card__timer">
                    ⚡ 10 min delivery
                </div>

                <h3 className="product-card__name">{product.name}</h3>
                <div className="product-card__weight">{product.unit}</div>

                <div className="product-card__bottom">
                    <div>
                        <span className="product-card__price">
                            ${hasDiscount ? product.discountPrice : product.price}
                        </span>
                        {hasDiscount && (
                            <span className="product-card__original-price">${product.price}</span>
                        )}
                    </div>

                    {/* Inline Add Button */}
                    <motion.button
                        className={`product-card__inline-add ${added ? 'product-card__inline-add--added' : ''}`}
                        onClick={handleAdd}
                        whileTap={{ scale: 0.92 }}
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
                                >
                                    ADD
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
