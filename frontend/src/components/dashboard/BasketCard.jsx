import React from 'react';

const basketItems = [
  {
    id: 1,
    name: 'Rustic Heirloom Tomatoes',
    description: 'Locally sourced, peak ripeness. Perfect for your preferred Caprese salads.',
    price: '$12.50',
    quantity: '2 lbs',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 2,
    name: 'Wild Yeast Sourdough',
    description: 'Fermented for 48 hours. Aligns with your low-glycemic bread preferences.',
    price: '$9.00',
    quantity: '1 Loaf',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
  },
];

const BasketCard = () => {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm flex flex-col gap-5"
      style={{ backgroundColor: '#FAF7F4', border: '1px solid rgba(0,0,0,0.06)' }}
    >
      {/* Top Row: Badge + Title + Buttons */}
      <div className="flex flex-col gap-3">
        {/* Badge */}
        <div className="flex items-center gap-1.5 w-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#705E46" stroke="none">
            <path d="M12 1l2.09 6.26H21l-5.47 3.97 2.09 6.26L12 13.51l-5.62 3.98 2.09-6.26L3 7.26h6.91L12 1z"/>
          </svg>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: '#EDE8E2', color: '#705E46' }}
          >
            AI Curated Bundle
          </span>
        </div>

        {/* Title + Buttons row */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-3xl font-bold leading-tight" style={{ color: '#422701' }}>
            This Week's<br />Basket
          </h2>
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 hover:bg-black/5"
              style={{ borderColor: '#C6C0B9', color: '#422701', backgroundColor: 'transparent' }}
            >
              Swap Items
            </button>
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: '#D6B588', color: '#422701' }}
            >
              Approve Basket
            </button>
          </div>
        </div>
      </div>

      <hr style={{ borderColor: 'rgba(0,0,0,0.07)' }} />

      {/* Items List */}
      <div className="flex flex-col gap-5">
        {basketItems.map((item) => (
          <div key={item.id} className="flex items-start gap-4">
            {/* Image */}
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold leading-tight" style={{ color: '#422701' }}>
                {item.name}
              </h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: '#705E46' }}>
                {item.description}
              </p>
            </div>

            {/* Price + Qty */}
            <div className="text-right shrink-0">
              <div className="text-base font-bold" style={{ color: '#422701' }}>
                {item.price}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#705E46' }}>
                {item.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasketCard;
