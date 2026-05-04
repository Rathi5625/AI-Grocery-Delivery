import React from 'react';
import ShowcaseNavbar from '../components/layout-showcase/ShowcaseNavbar';
import ShowcaseFooter from '../components/layout-showcase/ShowcaseFooter';

const LayoutShowcasePage = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#C6C0B9' }}>
      {/* ── Navbar ── */}
      <ShowcaseNavbar cartCount={3} />

      {/* ── Hero / Center Card Area ── */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div
          className="w-full max-w-xl text-center px-10 py-14 rounded-2xl shadow-lg flex flex-col items-center gap-6"
          style={{ backgroundColor: '#F5F1EC' }}
        >
          {/* Heading */}
          <h1
            className="text-3xl md:text-4xl font-bold leading-snug tracking-tight"
            style={{ color: '#422701' }}
          >
            Welcome to the Layout System
          </h1>

          {/* Paragraph */}
          <p
            className="text-base leading-relaxed max-w-sm"
            style={{ color: '#705E46' }}
          >
            This is the central canvas for FreshAI. The layout is built on a quiet luxury aesthetic,
            utilizing generous whitespace and organic tonal shifts to create a premium,
            frictionless experience.
          </p>

          {/* CTA Button */}
          <button
            className="mt-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 hover:shadow-md"
            style={{ backgroundColor: '#D6B588', color: '#422701' }}
          >
            Explore Components
          </button>
        </div>
      </main>

      {/* ── Footer ── */}
      <ShowcaseFooter />
    </div>
  );
};

export default LayoutShowcasePage;
