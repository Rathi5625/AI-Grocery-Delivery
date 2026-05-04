import React, { useRef, useEffect } from 'react';

const OtpInput = ({ length = 6, value, onChange, disabled }) => {
  const inputRefs = useRef([]);

  // Auto-focus first box
  useEffect(() => {
    if (!disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  const handleDigitChange = (index, val) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const next = [...value];
        next[index] = '';
        onChange(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    if (!pasted) return;
    const next = [...value];
    pasted.split('').forEach((ch, i) => { if (i < length) next[i] = ch; });
    onChange(next);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleDigitChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-semibold text-[#422701] bg-[#F5F1EB] border border-[#EAE5DF] rounded-lg focus:border-[#422701] focus:ring-1 focus:ring-[#422701] outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default OtpInput;
