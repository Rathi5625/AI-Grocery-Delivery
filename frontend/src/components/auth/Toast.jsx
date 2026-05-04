import React from 'react';

const Toast = ({ message, isError = false }) => {
  const bgColor = isError ? 'bg-[#422701]' : 'bg-[#EAE5DF]';
  const iconColor = isError ? 'bg-[#705E46]' : 'bg-[#705E46]';
  const textColor = isError ? 'text-[#D6B588]' : 'text-[#422701]';

  return (
    <div className={`absolute top-8 right-8 ${bgColor} px-6 py-4 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center gap-3 animate-[fade-in-down_0.3s_ease-out] z-50`}>
      <div className={`w-5 h-5 ${iconColor} rounded-full flex items-center justify-center text-white shrink-0`}>
        {isError ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      <span className={`text-sm font-medium ${textColor}`}>{message}</span>
    </div>
  );
};

export default Toast;
