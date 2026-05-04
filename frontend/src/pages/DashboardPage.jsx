import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import ProfileCard from '../components/dashboard/ProfileCard';
import ImpactCard from '../components/dashboard/ImpactCard';
import BasketCard from '../components/dashboard/BasketCard';
import RecipeCard from '../components/dashboard/RecipeCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const firstName = user?.firstName || 'there';

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: '#F5F1EC', fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <Sidebar active="curations" />

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <Topbar />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          {/* ── Welcome Header ── */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-3 tracking-tight"
              style={{ color: '#422701' }}
            >
              Welcome back, {firstName}.
            </h1>
            <p
              className="text-base leading-relaxed max-w-2xl"
              style={{ color: '#705E46' }}
            >
              Your personalized artisan grocery curation for the week is ready. Based on your
              recent preference for Mediterranean flavors and low-sodium organic produce.
            </p>
          </div>

          {/* ── 2-Column Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-6">
              <ProfileCard />
              <ImpactCard />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-6">
              <BasketCard />
              <RecipeCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
