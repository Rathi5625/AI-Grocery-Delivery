import React from 'react';

const HeroBanner = () => {
  return (
    <div className="w-full relative rounded-2xl overflow-hidden h-[340px] flex items-center justify-center shadow-md">
      {/* Background Image & Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920")' }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center flex flex-col items-center px-6 max-w-2xl mx-auto text-white mt-10">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase mb-3 opacity-90 text-white/80">
          AI Curated Picks
        </span>
        <h1 className="text-[42px] md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md leading-none">
          Your Personal Selection
        </h1>
        <p className="text-[15px] font-medium leading-relaxed text-[#F5F1EB] drop-shadow-sm max-w-xl">
          Curated specifically for your culinary profile, prioritizing local sourcing and regenerative practices.
        </p>
      </div>
    </div>
  );
};

export default HeroBanner;
