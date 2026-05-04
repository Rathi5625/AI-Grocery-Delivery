import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hoverLift, buttonClick } from '../../utils/animations';

const ProductCard = ({ product, onAdd }) => {
  const imageUrl = product.imageUrl || product.image || null;

  return (
    <motion.div
      variants={hoverLift}
      initial="initial"
      whileHover="whileHover"
      whileTap="whileTap"
      className="h-full"
    >
      <Link
        to={`/products/${product.id}`}
        className="block h-full bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col group cursor-pointer border border-[#C6C0B9]/20"
      >
        {/* Image Container */}
        <div className="relative h-48 w-full overflow-hidden bg-[#F5F1EB] flex items-center justify-center">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
            />
          ) : (
            <span className="text-5xl select-none">🥦</span>
          )}

          {/* In Stock Badge */}
          {product.stockQuantity > 0 && (
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <div className="w-1 h-1 rounded-full bg-[#16a34a]"></div>
              <span className="text-[9px] font-bold text-[#422701]">IN STOCK</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow gap-1">
          <span className="text-[9px] font-bold text-[#705E46] uppercase tracking-[0.1em]">
            {product.categoryName || product.category || 'Organic'}
          </span>

          <h3 className="text-[16px] font-bold text-[#422701] leading-tight line-clamp-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[12px] text-[#705E46] leading-relaxed line-clamp-2 opacity-80">
              {product.description}
            </p>
          )}

          {/* Footer (Price & Add) */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <span className="text-[18px] font-bold text-[#422701]">₹{Number(product.price).toFixed(2)}</span>

            {onAdd && (
              <motion.button
                variants={buttonClick}
                whileHover="whileHover"
                whileTap="whileTap"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(); }}
                className="w-8 h-8 rounded-lg bg-[#422701] text-[#D6B588] flex items-center justify-center focus:outline-none"
                aria-label={`Add ${product.name} to cart`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
