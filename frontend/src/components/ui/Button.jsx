import { motion } from 'framer-motion';
import { useRef } from 'react';

/**
 * Universal Button Component
 * Variants: primary, secondary, outline, danger, ghost, success
 * Sizes: sm, md, lg
 * States: loading, disabled
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  children,
  onClick,
  type = 'button',
  fullWidth = false,
  className = '',
  id,
  ...props
}) {
  const btnRef = useRef(null);

  const baseClass = [
    'btn-sys',
    `btn-sys--${variant}`,
    `btn-sys--${size}`,
    fullWidth ? 'btn-sys--full' : '',
    loading ? 'btn-sys--loading' : '',
    disabled ? 'btn-sys--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      ref={btnRef}
      type={type}
      className={baseClass}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
      id={id}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-sys__spinner" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="btn-sys__icon btn-sys__icon--left">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="btn-sys__icon btn-sys__icon--right">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
