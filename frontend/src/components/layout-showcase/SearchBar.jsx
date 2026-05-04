import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SearchBar = ({ placeholder = 'Search organic products...', value, onChange, onSubmit }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white"
      style={{ borderColor: '#C6C0B9', minWidth: '300px', maxWidth: '420px', width: '100%' }}
    >
      {/* Search icon */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="#705E46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0"
      >
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-sm border-none"
        style={{ color: '#422701' }}
      />
    </form>
  );
};

export default SearchBar;
