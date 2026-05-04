import React from 'react';
import { FiCreditCard, FiTruck, FiInfo } from 'react-icons/fi';

export default function PaymentSelector({ methods, selectedId, onSelect }) {
  const getIcon = (id) => {
    if (id === 'UPI') return <FiCreditCard size={18} className="text-[#422701]" />;
    if (id === 'COD') return <FiTruck size={18} className="text-[#422701]" />;
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

      {/* Test mode notice shown when UPI/Card online is selected */}
      {selectedId === 'UPI' && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <FiInfo size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="text-[0.8rem] text-amber-800 leading-relaxed">
            <p className="font-semibold mb-2">🧪 Razorpay Test Mode — Use Indian Test Cards</p>
            <p className="mb-2 text-amber-700">International cards are blocked in test mode. Use these <strong>Indian domestic</strong> test credentials:</p>
            <div className="space-y-1.5">
              <div className="bg-amber-100 rounded-lg px-3 py-2">
                <p className="font-bold text-amber-900 mb-0.5">💳 Visa (Domestic)</p>
                <p>Card: <strong>4718 6091 5030 8247</strong></p>
                <p>CVV: <strong>123</strong> &nbsp;|&nbsp; Expiry: <strong>12/26</strong> &nbsp;|&nbsp; OTP: <strong>1234</strong></p>
              </div>
              <div className="bg-amber-100 rounded-lg px-3 py-2">
                <p className="font-bold text-amber-900 mb-0.5">💳 Mastercard (Domestic)</p>
                <p>Card: <strong>5267 3181 8797 5449</strong></p>
                <p>CVV: <strong>123</strong> &nbsp;|&nbsp; Expiry: <strong>12/26</strong> &nbsp;|&nbsp; OTP: <strong>1234</strong></p>
              </div>
              <div className="bg-amber-100 rounded-lg px-3 py-2">
                <p className="font-bold text-amber-900 mb-0.5">📱 Test UPI ID</p>
                <p><strong>success@razorpay</strong> (always succeeds)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
