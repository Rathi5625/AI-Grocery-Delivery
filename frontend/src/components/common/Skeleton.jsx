import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className, width, height, circle }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: 1.2,
        ease: "easeInOut"
      }}
      className={`bg-gray-200 ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ width, height }}
    />
  );
};

export const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-[#C6C0B9]/20 p-4">
    <Skeleton height="200px" className="mb-4" />
    <Skeleton width="40%" height="12px" className="mb-3" />
    <Skeleton width="80%" height="24px" className="mb-2" />
    <Skeleton width="90%" height="16px" className="mb-6" />
    <div className="flex justify-between items-center">
      <Skeleton width="30%" height="24px" />
      <Skeleton width="36px" height="36px" circle />
    </div>
  </div>
);

export const OrderSkeleton = () => (
  <div className="bg-white rounded-xl p-6 mb-4 border border-[#C6C0B9]/20">
    <div className="flex justify-between mb-4">
      <Skeleton width="120px" height="20px" />
      <Skeleton width="80px" height="24px" />
    </div>
    <div className="flex gap-4 mb-4">
      <Skeleton width="60px" height="60px" />
      <div className="flex-1">
        <Skeleton width="60%" height="16px" className="mb-2" />
        <Skeleton width="30%" height="14px" />
      </div>
    </div>
    <div className="h-px bg-gray-100 my-4" />
    <div className="flex justify-between">
      <Skeleton width="100px" height="16px" />
      <Skeleton width="120px" height="20px" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white p-6 rounded-2xl border border-[#C6C0B9]/20">
        <div className="flex items-center gap-4">
          <Skeleton width="48px" height="48px" circle />
          <div className="flex-1">
            <Skeleton width="50%" height="14px" className="mb-2" />
            <Skeleton width="80%" height="28px" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
