import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-[#D6B588] p-8 md:p-10 rounded-[24px] flex flex-col gap-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 bg-[#C6C0B9] rounded-full flex items-center justify-center text-[#422701] shrink-0">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-semibold text-[#422701] tracking-tight">{title}</h3>
      <p className="text-sm md:text-base text-[#705E46] leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
