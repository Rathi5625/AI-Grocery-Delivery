import React from 'react';

const ImpactCard = () => {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm flex flex-col gap-4"
      style={{ backgroundColor: '#FAF7F4', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Icon + Title row */}
      <div className="flex items-start gap-4">
        {/* Icon circle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#EDE8E2' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#422701" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold leading-tight" style={{ color: '#422701' }}>
            Impact<br />Summary
          </h2>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed" style={{ color: '#705E46' }}>
        By choosing this curated basket over standard grocery delivery.
      </p>

      <hr style={{ borderColor: 'rgba(0,0,0,0.07)' }} />

      {/* Metrics */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: '#705E46' }}>CO2e Saved</span>
          <span className="text-sm font-bold" style={{ color: '#422701' }}>14.2 lbs</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: '#705E46' }}>Packaging</span>
          <span
            className="text-xs font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: '#D6B588', color: '#422701' }}
          >
            100% Plastic-Free
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImpactCard;
