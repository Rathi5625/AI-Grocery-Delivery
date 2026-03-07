import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiStar } from 'react-icons/fi';
import { RiLeafLine } from 'react-icons/ri';

export default function ProductCard({ product, onAddToCart, index = 0 }) {
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    return (
        <motion.div
            className="product-card"
            id={`product-${product.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ y: -3 }}
        >
            <Link to={`/products/${product.id}`}>
                <div className="product-card__image-wrap">
                    <img
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=400'}
                        alt={product.name}
                        className="product-card__image"
                        loading="lazy"
                    />

                    {/* Badges */}
                    <div className="product-card__badges">
                        {hasDiscount && <span className="product-card__badge product-card__badge--sale">{discountPct}% OFF</span>}
                        {product.isOrganic && <span className="product-card__badge product-card__badge--organic">Organic</span>}
                    </div>

                    {/* Eco Score */}
                    {product.sustainabilityScore && (
                        <div className="product-card__eco-score" title="Eco Score">
                            <RiLeafLine size={10} />
                            {product.sustainabilityScore}
                        </div>
                    )}
                </div>
            </Link>

            {/* Quick Add Overlay Button */}
            <motion.button
                className="product-card__add-btn"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product.id); }}
                whileTap={{ scale: 0.9 }}
                id={`add-to-cart-${product.id}`}
            >
                <FiPlus size={14} /> ADD
            </motion.button>

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
                        className="product-card__inline-add"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product.id); }}
                        whileTap={{ scale: 0.92 }}
                    >
                        ADD
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
