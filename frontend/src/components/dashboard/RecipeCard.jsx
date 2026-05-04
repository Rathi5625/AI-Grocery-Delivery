import React from 'react';

const RecipeCard = () => {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm flex"
      style={{ backgroundColor: '#FAF7F4', border: '1px solid rgba(0,0,0,0.06)', minHeight: '220px' }}
    >
      {/* Left: Large Food Image */}
      <div className="w-2/5 shrink-0 relative">
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
          alt="Heirloom Tomato & Sourdough Panzanella"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right: Content */}
      <div className="flex-1 p-6 flex flex-col gap-3 justify-center">
        {/* Badge */}
        <div className="flex items-center gap-1.5 w-fit">
          <span style={{ color: '#D6B588' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            </svg>
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#EDE8E2', color: '#705E46' }}
          >
            Smart Pairing
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold leading-snug" style={{ color: '#422701' }}>
          Heirloom Tomato &<br />Sourdough Panzanella
        </h2>

        {/* Description */}
        <p className="text-xs leading-relaxed" style={{ color: '#705E46' }}>
          Generated instantly using your weekly basket items. A refreshing, rustic lunch that requires zero cooking and maximizes the flavor of peak-season produce.
        </p>

        {/* Meta Info + CTA */}
        <div className="flex items-center gap-5 mt-1 flex-wrap">
          {/* Prep Time */}
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-xs font-medium" style={{ color: '#705E46' }}>15 Min Prep</span>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
              <path d="M7 2v20"/>
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
            </svg>
            <span className="text-xs font-medium" style={{ color: '#705E46' }}>Beginner</span>
          </div>

          {/* CTA Link */}
          <button
            className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity ml-auto"
            style={{ color: '#422701' }}
          >
            View Full Recipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
