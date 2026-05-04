import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#422701] text-[#D6B588] py-10 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-lg md:text-xl font-bold tracking-[0.2em] uppercase">
          ArtisanPantry AI
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[11px] md:text-xs font-bold tracking-widest text-[#705E46]">
          <a href="#privacy" className="hover:text-[#D6B588] transition-colors">PRIVACY POLICY</a>
          <a href="#terms" className="hover:text-[#D6B588] transition-colors">TERMS OF SERVICE</a>
          <a href="#wholesale" className="hover:text-[#D6B588] transition-colors">WHOLESALE</a>
          <a href="#contact" className="hover:text-[#D6B588] transition-colors">CONTACT US</a>
        </div>
        
        <div className="text-[10px] md:text-xs font-semibold tracking-wider text-[#705E46]">
          © 2024 ARTISANPANTRY AI. CONSCIOUSLY CURATED.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
