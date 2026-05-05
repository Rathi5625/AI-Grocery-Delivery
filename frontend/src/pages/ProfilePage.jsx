import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useProfile from '../hooks/useProfile';
import Sidebar from '../components/profile/Sidebar';
import ProfileCard from '../components/profile/ProfileCard';
import OrdersCard from '../components/profile/OrdersCard';
import AddressCard from '../components/profile/AddressCard';

export default function ProfilePage() {
  const { user } = useAuth();
  const hook = useProfile();
  const { profile, loading } = hook;

  // fetchProfile is already called inside useProfile's own useEffect,
  // so no need to call fetchAddresses or fetchOrders here.

  const firstName = hook.profile?.firstName || user?.firstName || 'there';

  return (
    <div className="min-h-screen bg-[#C6C0B9] font-sans flex text-[#422701]">

      {/* SIDEBAR */}
      <div className="hidden md:block sticky top-0 h-screen">
        <Sidebar profile={hook.profile} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-10 md:py-16">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-[38px] md:text-[44px] font-bold text-[#422701] mb-2 tracking-tight leading-tight">
                Welcome Back, {firstName}.
              </h1>
              <p className="text-[16px] text-[#705E46] font-light">
                Manage your organic lifestyle and curated deliveries.
              </p>
            </div>

            <div className="bg-[#EBEAE5] px-4.5 py-2.5 rounded-full flex items-center gap-2.5 shadow-sm border border-[#EAE5DF]">
              <div className="w-2 h-2 rounded-full bg-[#D6B588]"></div>
              <span className="text-[11px] font-bold text-[#422701] tracking-[0.1em] uppercase">
                AI Curation Active
              </span>
            </div>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: PROFILE CARD */}
            <div className="lg:col-span-4 flex flex-col">
              <ProfileCard hook={hook} />
            </div>

            {/* RIGHT COLUMN: ORDERS + ADDRESSES */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              <OrdersCard hook={hook} />
              <AddressCard hook={hook} />
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
