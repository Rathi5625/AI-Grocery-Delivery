import React from 'react';
import { Link } from 'react-router-dom';

const DELIVERY_THRESHOLD = 50;

export default function OrderSummary({ itemCount, subtotal, deliveryFee, serviceFee, total }) {
  const canCheckout = itemCount > 0;
  const amountToFreeDelivery = DELIVERY_THRESHOLD - subtotal;

  return (
    <div className="bg-[#F2ECE4] rounded-2xl p-8 shadow-sm flex flex-col h-fit sticky top-8">
      <h2 className="text-2xl font-medium text-[#422701] mb-8">Order Summary</h2>

      <div className="space-y-4 mb-6 text-[15px]">
        <div className="flex justify-between text-[#705E46]">
          <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[#705E46]">
          <span>Delivery Fee</span>
          <span>
            {deliveryFee === 0 && subtotal > 0
              ? <span className="text-green-600 font-medium">Free</span>
              : `$${deliveryFee.toFixed(2)}`
            }
          </span>
        </div>
        <div className="flex justify-between text-[#705E46]">
          <span>Service Fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
      </div>

      {/* Free delivery nudge */}
      {amountToFreeDelivery > 0 && subtotal > 0 && (
        <div className="bg-[#D6B588]/20 border border-[#D6B588]/40 rounded-xl px-4 py-3 mb-6">
          <p className="text-[12px] text-[#705E46] text-center">
            Add <span className="font-semibold text-[#422701]">${amountToFreeDelivery.toFixed(2)}</span> more for free delivery
          </p>
        </div>
      )}

      <div className="border-t border-[#C6C0B9]/50 my-2"></div>

      <div className="flex justify-between items-center my-6">
        <span className="text-2xl font-medium text-[#422701]">Total</span>
        <span className="text-2xl font-bold text-[#422701]">${total.toFixed(2)}</span>
      </div>

      {canCheckout ? (
        <Link
          to="/checkout"
          className="block w-full text-center py-4 bg-[#D6B588] hover:bg-[#c9a778] text-[#422701] rounded-xl font-semibold text-[16px] transition-colors shadow-sm mb-4"
        >
          Proceed to Checkout
        </Link>
      ) : (
        <button
          disabled
          className="block w-full text-center py-4 bg-[#C6C0B9]/40 text-[#705E46] rounded-xl font-semibold text-[16px] cursor-not-allowed mb-4"
        >
          Proceed to Checkout
        </button>
      )}

      <p className="text-center text-sm text-[#705E46]">Taxes calculated at checkout</p>
    </div>
  );
}
