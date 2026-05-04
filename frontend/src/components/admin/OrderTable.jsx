import React from 'react';
import OrderRow from './OrderRow';

export default function OrderTable({ orders, onStatusChange }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-[#FDFBF7] rounded-2xl border border-[#C6C0B9]/40 shadow-sm flex flex-col items-center justify-center py-24 mt-8">
        <p className="text-[#705E46] text-lg font-medium">No orders found</p>
        <p className="text-[#A89F91] text-sm mt-1">Try adjusting your search or filter</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] rounded-xl border border-[#C6C0B9]/30 shadow-[0_2px_10px_-4px_rgba(198,192,185,0.2)] overflow-hidden flex flex-col mt-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#C6C0B9]/30 bg-[#FAF7F2]">
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[15%]">Order ID</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[25%] pl-7">Customer</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[25%]">Date & Time</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[20%]">Status</th>
              <th className="py-4 px-6 text-[0.7rem] font-bold text-[#705E46] uppercase tracking-[0.1em] w-[15%]">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <OrderRow key={order.id || idx} order={order} onStatusChange={onStatusChange} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
