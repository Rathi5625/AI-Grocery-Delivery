import React, { useState } from 'react';
import { FiMapPin, FiBriefcase, FiPlus, FiCheckCircle } from 'react-icons/fi';

export default function AddressSelector({ addresses, selectedId, onSelect, customAddress, onCustomAddressChange, useCustomAddress, onSetUseCustomAddress }) {
  const getIcon = (label) => {
    if (!label) return <FiMapPin size={15} />;
    if (label.toLowerCase() === 'home') return <FiMapPin size={15} />;
    if (label.toLowerCase() === 'office') return <FiBriefcase size={15} />;
    return <FiMapPin size={15} />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-[#C6C0B9]/20">
      <h2 className="text-[1.1rem] font-medium text-[#422701] mb-5 tracking-tight">Delivery Address</h2>
      
      {addresses.length > 0 && !useCustomAddress ? (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <label 
              key={addr.id}
              className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${
                selectedId === addr.id 
                  ? 'border-[#D6B588] bg-[#FDFBF7]' 
                  : 'border-[#C6C0B9]/30 hover:border-[#D6B588]/50'
              }`}
            >
              <div className="flex items-center h-5 mt-1 mr-3.5">
                <input 
                  type="radio" 
                  name="address" 
                  className="w-4 h-4 accent-[#D6B588]"
                  checked={selectedId === addr.id}
                  onChange={() => onSelect(addr.id)}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-[#422701]">
                  {getIcon(addr.label || addr.type)}
                  <span className="font-semibold text-sm">{addr.label || addr.type || 'Address'}</span>
                </div>
                <p className="text-[#705E46] text-[0.85rem] leading-relaxed">
                  {addr.streetAddress || addr.line1}<br />
                  {addr.city}, {addr.state} {addr.postalCode || addr.zip}
                </p>
              </div>
            </label>
          ))}
          
          <button 
            type="button" 
            onClick={() => onSetUseCustomAddress(true)}
            className="flex items-center gap-2 text-[#705E46] font-medium text-[0.9rem] pt-2 hover:text-[#422701] transition-colors"
          >
            <FiPlus size={16} /> Enter a different address
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#705E46] text-[0.85rem] mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={customAddress.name}
                onChange={(e) => onCustomAddressChange({ ...customAddress, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C6C0B9]/40 focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588] outline-none transition-all text-[#422701]"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-[#705E46] text-[0.85rem] mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                value={customAddress.phone}
                onChange={(e) => onCustomAddressChange({ ...customAddress, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C6C0B9]/40 focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588] outline-none transition-all text-[#422701]"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[#705E46] text-[0.85rem] mb-1.5">Street Address</label>
            <input 
              type="text" 
              value={customAddress.address}
              onChange={(e) => onCustomAddressChange({ ...customAddress, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#C6C0B9]/40 focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588] outline-none transition-all text-[#422701]"
              placeholder="123 Main St, Apt 4B"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#705E46] text-[0.85rem] mb-1.5">City</label>
              <input 
                type="text" 
                value={customAddress.city}
                onChange={(e) => onCustomAddressChange({ ...customAddress, city: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C6C0B9]/40 focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588] outline-none transition-all text-[#422701]"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-[#705E46] text-[0.85rem] mb-1.5">Postal Code</label>
              <input 
                type="text" 
                value={customAddress.pincode}
                onChange={(e) => onCustomAddressChange({ ...customAddress, pincode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#C6C0B9]/40 focus:border-[#D6B588] focus:ring-1 focus:ring-[#D6B588] outline-none transition-all text-[#422701]"
                placeholder="ZIP Code"
              />
            </div>
          </div>

          {addresses.length > 0 && (
            <button 
              type="button" 
              onClick={() => onSetUseCustomAddress(false)}
              className="flex items-center gap-2 text-[#705E46] font-medium text-[0.9rem] pt-2 hover:text-[#422701] transition-colors"
            >
              Cancel and use saved address
            </button>
          )}
        </div>
      )}
    </div>
  );
}
