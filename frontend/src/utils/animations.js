/**
 * Global Animation System for FreshAI
 * Using Framer Motion variants for consistency and premium feel.
 */

export const pageVariants = {
  initial: {
    opacity: 0,
    y: 15,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1], // Standard decelerate
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1], // Accelerate
    },
  },
};

export const authPageVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  }),
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

export const hoverLift = {
  whileHover: { 
    y: -5,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  whileTap: { scale: 0.98 },
};

export const buttonClick = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.96 },
};

export const listStagger = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};
