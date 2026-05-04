import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SuccessCard from '../components/checkout/SuccessCard';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-[440px]"
      >
        <SuccessCard orderId={order?.orderNumber || '#FAI-89247'} />
      </motion.div>
    </div>
  );
}
