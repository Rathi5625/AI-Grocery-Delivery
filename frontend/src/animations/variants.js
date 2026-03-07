/* Re-usable Framer Motion animation variants for page/component transitions */

export const pageTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0 },
};

export const slideUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

export const staggerContainer = {
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } },
};

export const cartBounce = {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 0.95, 1.05, 1], transition: { duration: 0.5, ease: 'easeInOut' } },
};

export const slideInRight = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 250 } },
    exit: { x: '100%', opacity: 0, transition: { duration: 0.25 } },
};

export const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalVariants = {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 22, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

export const successPulse = {
    initial: { scale: 0, rotate: -45 },
    animate: {
        scale: 1, rotate: 0,
        transition: { type: 'spring', damping: 12, stiffness: 200, delay: 0.1 },
    },
};
