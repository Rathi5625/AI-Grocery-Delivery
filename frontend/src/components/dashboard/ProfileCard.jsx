import React from 'react';

const ProfileCard = () => {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm flex flex-col gap-5"
      style={{ backgroundColor: '#FAF7F4', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ color: '#422701' }}>
          Your Palate Profile
        </h2>
        {/* Sliders icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
          <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
          <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
          <line x1="17" y1="16" x2="23" y2="16"/>
        </svg>
      </div>

      <hr style={{ borderColor: 'rgba(0,0,0,0.07)' }} />

      {/* Dominant Flavor Notes */}
      <div className="flex flex-col gap-3">
        <p
          className="text-[10px] font-bold tracking-[0.15em] uppercase"
          style={{ color: '#705E46' }}
        >
          Dominant Flavor Notes
        </p>
        <div className="flex flex-wrap gap-2">
          {['Earthy', 'Umami', 'Herbaceous'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#EDE8E2', color: '#422701' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <hr style={{ borderColor: 'rgba(0,0,0,0.07)' }} />

      {/* AI Dietary Constraints */}
      <div className="flex flex-col gap-3">
        <p
          className="text-[10px] font-bold tracking-[0.15em] uppercase"
          style={{ color: '#705E46' }}
        >
          AI Dietary Constraints
        </p>
        <div className="flex flex-wrap gap-2">
          {['Organic Only', 'Low Sodium'].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: 'transparent',
                color: '#705E46',
                borderColor: '#C6C0B9',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
