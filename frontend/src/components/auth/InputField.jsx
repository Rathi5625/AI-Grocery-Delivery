import React from 'react';

const InputField = ({ 
  label, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  leftIcon,
  rightIcon, 
  icon, 
  isOptional, 
  required = false,
  labelRight 
}) => {
  const finalRightIcon = rightIcon || icon;
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label className="text-[11px] md:text-xs font-bold text-[#422701] tracking-wide">{label}</label>
        {isOptional && <span className="text-[11px] text-[#705E46] opacity-80">Optional</span>}
        {labelRight && <div className="text-[11px]">{labelRight}</div>}
      </div>
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]">
            {leftIcon}
          </div>
        )}
        <input 
          type={type} 
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-[#C6C0B9]/30 border border-transparent rounded-lg py-3.5 text-sm text-[#422701] outline-none focus:border-[#D6B588] focus:bg-[#C6C0B9]/40 transition-colors placeholder-[#705E46]/60 ${leftIcon ? 'pl-11' : 'pl-4'} ${finalRightIcon ? 'pr-11' : 'pr-4'}`}
        />
        {finalRightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#705E46] cursor-pointer">
            {finalRightIcon}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;
