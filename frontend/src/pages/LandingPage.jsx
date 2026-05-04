import React from 'react';
import { Link } from 'react-router-dom';
import FeatureCard from '../components/landing/FeatureCard';
import { LuBrain, LuLeaf, LuRecycle } from 'react-icons/lu';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#C6C0B9]">

      {/* Hero Section */}
      <main className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

        {/* Left Side (Text content) */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
          <div className="bg-[#D6B588] text-[#422701] text-[10px] sm:text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 uppercase tracking-wide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.2 2.3c.3-.9 1.4-.9 1.6 0l1.6 5.2a1.7 1.7 0 0 0 1.6 1.1h5.4c1 0 1.4 1.2.6 1.8l-4.4 3.2a1.7 1.7 0 0 0-.6 1.9l1.6 5.2c.3.9-.8 1.6-1.5 1l-4.4-3.2a1.7 1.7 0 0 0-2 0l-4.4 3.2c-.7.6-1.8-.1-1.5-1l1.6-5.2a1.7 1.7 0 0 0-.6-1.9L1.8 10.4c-.8-.6-.4-1.8.6-1.8h5.4a1.7 1.7 0 0 0 1.6-1.1L11.2 2.3z" /></svg>
            AI-POWERED CURATION
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-bold text-[#422701] leading-[1.05] tracking-tighter">
            <span className="italic">Groceries,</span><br />
            <span className="font-normal text-[#705E46] not-italic tracking-tight">Curated by</span><br />
            <span className="italic">Intelligence</span>
          </h1>

          <p className="text-[#705E46] text-base sm:text-lg lg:text-xl max-w-md leading-relaxed mt-2 font-medium">
            Experience a sophisticated pantry replenishment service that learns your taste, prioritizes organic origins, and delivers with a minimal footprint.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full sm:w-auto">
            <Link
              to="/products"
              className="w-full sm:w-auto bg-[#422701] text-[#D6B588] px-8 py-4 rounded-xl font-bold text-sm tracking-wider hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-md uppercase flex justify-center items-center"
            >
              START CURATING
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto border-[1.5px] border-[#422701] text-[#422701] px-8 py-4 rounded-xl font-bold text-sm tracking-wider hover:bg-[#422701] hover:text-[#D6B588] hover:-translate-y-0.5 transition-all uppercase flex justify-center items-center"
            >
              EXPLORE STAPLES
            </Link>
          </div>
        </div>

        {/* Right Side (Image Card) */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="w-full max-w-xl aspect-[4/5] sm:aspect-square bg-[#D6B588] rounded-[32px] overflow-hidden shadow-2xl relative transform transition-transform duration-500 hover:scale-[1.02]">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"
              alt="Curated Groceries"
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay at bottom to match screenshot styling */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="w-full bg-[#EBE5DF] py-24 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#422701] mb-6 tracking-tight">The Artisan Approach</h2>
            <p className="text-[#705E46] text-base md:text-xl font-medium">Elevating the everyday through thoughtful intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            <FeatureCard
              icon={<LuBrain size={24} />}
              title="Smart Cart"
              description="Our AI predicts your needs, ensuring your pantry is always stocked with precisely what you use, reducing waste."
            />
            <FeatureCard
              icon={<LuLeaf size={24} />}
              title="Freshness First"
              description="Sourced locally when possible, prioritizing organic farms to guarantee the highest quality and taste."
            />
            <FeatureCard
              icon={<LuRecycle size={24} />}
              title="Sustainability"
              description="Delivered in 100% compostable or reusable packaging. We believe luxury shouldn't cost the earth."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

