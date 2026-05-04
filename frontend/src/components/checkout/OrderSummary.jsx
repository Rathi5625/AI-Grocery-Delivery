import React from 'react';

export default function OrderSummary({ items, subtotal, curationFee, deliveryFee, total }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-32 border border-[#C6C0B9]/20">
      <h2 className="text-[1.1rem] font-medium text-[#422701] mb-6 tracking-tight">Order Summary</h2>
      
      <div className="space-y-5 mb-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#FAF5EF] flex items-center justify-center shrink-0 overflow-hidden">
               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-[#422701] text-[0.95rem]">{item.name}</h4>
              <p className="text-[#705E46] text-[0.8rem] mt-0.5">Qty: {item.quantity}</p>
            </div>
            <div className="text-[#422701] text-[0.95rem] flex items-center">
              ${item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-[#C6C0B9]/20 pt-5 space-y-3.5 mb-5">
        <div className="flex justify-between text-[0.9rem] text-[#705E46]">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[0.9rem] text-[#705E46]">
          <span>AI Curation Fee</span>
          <span>${curationFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[0.9rem] text-[#705E46]">
          <span>Delivery</span>
          <span className="text-[#D6B588] font-medium">{deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}</span>
        </div>
      </div>
      
      <div className="border-t border-[#C6C0B9]/20 pt-5 flex justify-between items-center">
        <span className="text-[1.1rem] font-medium text-[#422701]">Total</span>
        <span className="text-[1.15rem] font-bold text-[#422701]">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
