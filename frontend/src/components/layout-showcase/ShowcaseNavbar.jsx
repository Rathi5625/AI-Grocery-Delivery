import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

const ShowcaseNavbar = ({ cartCount = 3 }) => {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    // no-op for showcase
  };

  return (
    <nav
      className="w-full flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* ── Logo ── */}
      <Link to="/" className="text-3xl font-black tracking-tight shrink-0" style={{ color: '#422701' }}>
        FreshAI
      </Link>

      {/* ── Search Bar (center) ── */}
      <div className="flex-1 flex justify-center px-6">
        <SearchBar
          placeholder="Search organic products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSubmit={handleSearch}
        />
      </div>

      {/* ── Right Actions ── */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/"
            className="text-sm font-semibold pb-0.5 transition-colors"
            style={{
              color: '#422701',
              borderBottom: isActive('/') ? '2px solid #422701' : '2px solid transparent',
            }}
          >
            Home
          </Link>
          <Link
            to="/products"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: '#705E46' }}
          >
            Shop
          </Link>
        </div>

        {/* Cart */}
        <Link to="/cart" className="relative flex items-center" style={{ color: '#422701' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: '#D6B588' }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <button style={{ color: '#422701' }} className="hover:opacity-70 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default ShowcaseNavbar;
