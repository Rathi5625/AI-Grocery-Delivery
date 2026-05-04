import React from 'react';
import { FiCreditCard, FiSmartphone } from 'react-icons/fi';

export default function PaymentSelector({ methods, selectedId, onSelect }) {
  const getIcon = (id) => {
    if (id === 'UPI') return <FiCreditCard size={18} className="text-[#422701]" />;
    if (id === 'COD') return <FiSmartphone size={18} className="text-[#422701]" />;
    return <FiCreditCard size={18} className="text-[#422701]" />;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border border-[#C6C0B9]/20">
      <h2 className="text-[1.1rem] font-medium text-[#422701] mb-5 tracking-tight">Payment Method</h2>
      
      <div className="space-y-4">
        {methods.map((method) => (
          <label 
            key={method.id}
            className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
              selectedId === method.id 
                ? 'border-[#D6B588] bg-[#FDFBF7]' 
                : 'border-[#C6C0B9]/30 hover:border-[#D6B588]/50'
            }`}
          >
            <div className="flex items-center h-5 mr-4">
              <input 
                type="radio" 
                name="payment" 
                className="w-4 h-4 accent-[#D6B588]"
                checked={selectedId === method.id}
                onChange={() => onSelect(method.id)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#FAF5EF] p-2.5 rounded-lg flex items-center justify-center">
                {getIcon(method.id)}
              </div>
              <span className="text-[#422701] text-[0.95rem]">{method.label}</span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
