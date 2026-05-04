import React from 'react';
import { FiTrendingUp, FiMinus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { hoverLift } from '../../utils/animations';

export default function StatCard({ title, value, growth, growthText, icon: Icon, isPositive, isNeutral }) {
  return (
    <motion.div 
      variants={hoverLift}
      whileHover="whileHover"
      whileTap="whileTap"
      className="bg-[#FDFBF7] rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(198,192,185,0.3)] border border-[#C6C0B9]/20 flex flex-col justify-between h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[#705E46] text-[0.85rem] font-medium mb-1 tracking-wide">{title}</h3>
          <p className="text-[1.75rem] font-semibold text-[#422701] leading-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#EAE5DA] text-[#422701] flex items-center justify-center shrink-0">
          <Icon size={18} />
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 mt-2">
        <span className={`text-[0.75rem] font-bold flex items-center gap-0.5 ${
          isPositive ? 'text-[#16a34a]' : isNeutral ? 'text-[#9ca3af]' : 'text-[#dc2626]'
        }`}>
          {isPositive ? <FiTrendingUp size={12} /> : isNeutral ? <FiMinus size={12} /> : null}
          {growth}
        </span>
        <span className="text-[#705E46] text-[0.75rem]">{growthText}</span>
      </div>
    </motion.div>
  );
}
