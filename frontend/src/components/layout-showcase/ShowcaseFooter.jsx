import React, { useState } from 'react';

const ShowcaseFooter = () => {
  const [email, setEmail] = useState('');

  return (
    <footer style={{ backgroundColor: '#422701' }} className="w-full">
      {/* Main footer content */}
      <div className="max-w-6xl mx-auto px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* ── LEFT: Brand ── */}
        <div className="flex flex-col gap-4">
          <span className="text-2xl font-black tracking-tight text-white">FreshAI</span>
          <p className="text-sm leading-relaxed" style={{ color: '#C6C0B9' }}>
            Curating the finest organic ingredients with the precision of artificial intelligence.
            Nourishing tranquility.
          </p>
        </div>

        {/* ── CENTER: Quick Links ── */}
        <div className="flex flex-col gap-4">
          <h3
            className="text-xs font-bold tracking-[0.18em] uppercase"
            style={{ color: '#D6B588' }}
          >
            Quick Links
          </h3>
          <nav className="flex flex-col gap-3">
            {['About', 'Links', 'Contact'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm transition-opacity hover:opacity-80"
                style={{ color: '#C6C0B9' }}
              >
                {link}
              </a>
            ))}
          </nav>
        </div>

        {/* ── RIGHT: Stay Connected ── */}
        <div className="flex flex-col gap-4">
          <h3
            className="text-xs font-bold tracking-[0.18em] uppercase"
            style={{ color: '#D6B588' }}
          >
            Stay Connected
          </h3>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none border-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            />
            <button
              className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shrink-0"
              style={{ backgroundColor: '#D6B588', color: '#422701' }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="border-t px-8 py-5 flex items-center justify-between max-w-6xl mx-auto"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        <p className="text-xs" style={{ color: '#C6C0B9' }}>
          © 2024 FreshAI. All rights reserved.
        </p>

        {/* Small icons */}
        <div className="flex items-center gap-3" style={{ color: '#C6C0B9' }}>
          {/* Shield icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          {/* Globe/search icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      </div>
    </footer>
  );
};

export default ShowcaseFooter;
