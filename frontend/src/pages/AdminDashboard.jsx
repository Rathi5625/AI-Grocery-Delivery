import React, { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiCalendar } from 'react-icons/fi';
import { FiUsers, FiFileText, FiBox, FiDollarSign } from 'react-icons/fi';
import Sidebar from '../components/admin/Sidebar';
import StatCard from '../components/admin/StatCard';
import { RevenueChart, OrdersDensityChart } from '../components/admin/DashboardCharts';
import { getDashboardStats, getRevenueStats, getOrdersDensity } from '../api/adminApi';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInScale } from '../utils/animations';
import { DashboardSkeleton } from '../components/common/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    revenue: 0,
  });
  
  const [revenueData, setRevenueData] = useState([]);
  const [densityData, setDensityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashRes, revRes, densityRes] = await Promise.all([
          getDashboardStats(),
          getRevenueStats('7days'),
          getOrdersDensity()
        ]);
        
        const data = dashRes.data?.data || dashRes.data;
        setStats({
          totalUsers: data.totalUsers || 0,
          totalOrders: data.totalOrders || 0,
          totalProducts: data.totalProducts || 0,
          revenue: data.totalRevenue || 0,
        });

        const revData = revRes.data?.data || revRes.data;
        const denData = densityRes.data?.data || densityRes.data;

        // Process revenue dates to short days like "Mon", "Tue"
        const formattedRev = revData.map(item => ({
          day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          value: item.revenue,
          color: '#E5DFD6'
        }));
        
        // Mark the last item as the highlight color
        if (formattedRev.length > 0) {
          formattedRev[formattedRev.length - 1].color = '#705E46';
          if (formattedRev.length > 1) {
            formattedRev[formattedRev.length - 2].color = '#D6B588';
          }
        }
        
        setRevenueData(formattedRev);
        setDensityData(denData.map((d, i) => ({ time: String(i + 1), value: d.value })));
        
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Layout */}
      <div className="flex-1 ml-[260px] flex flex-col">
        {/* Top Header */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-[#C6C0B9]/20 bg-[#FAF7F2] sticky top-0 z-10">
          <div className="relative w-[340px]">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#705E46]" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-[#F2ECE4] border-none rounded-full py-2.5 pl-11 pr-4 text-[0.95rem] text-[#422701] placeholder:text-[#A89F91] focus:outline-none focus:ring-1 focus:ring-[#D6B588] transition-shadow"
            />
          </div>
          
          <div className="flex items-center gap-7">
            <button className="text-[#e28833] hover:text-[#cba878] transition-colors relative">
              <FiBell size={20} />
            </button>
            <button className="w-5 h-5 rounded-full bg-[#e28833] text-white flex items-center justify-center hover:bg-[#cba878] transition-colors">
              <span className="text-[11px] font-bold">?</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-[#C6C0B9]/20">
              <div className="w-4 h-4 bg-white/20 rounded-full mt-2" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-10">
          {/* Page Header */}
          <div className="flex justify-between items-start mb-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-[2.2rem] font-medium text-[#422701] mb-1 tracking-tight">Overview</h1>
              <p className="text-[#705E46] text-[1.05rem]">Here's what's happening with your store today.</p>
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2.5 bg-[#FDFBF7] border border-[#C6C0B9]/30 rounded-xl px-5 py-2.5 text-[#422701] font-medium shadow-sm hover:shadow transition-all text-[0.95rem] tracking-wide"
            >
              <FiCalendar size={16} className="text-[#422701]" />
              Today
            </motion.button>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200">
               {error}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div variants={fadeInScale}>
                  <StatCard 
                    title="Total Users" 
                    value={stats.totalUsers.toLocaleString()} 
                    growth="12%" 
                    growthText="vs last month" 
                    icon={FiUsers} 
                    isPositive={true} 
                  />
                </motion.div>
                <motion.div variants={fadeInScale}>
                  <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders.toLocaleString()} 
                    growth="8.4%" 
                    growthText="vs last month" 
                    icon={FiFileText} 
                    isPositive={true} 
                  />
                </motion.div>
                <motion.div variants={fadeInScale}>
                  <StatCard 
                    title="Total Products" 
                    value={stats.totalProducts.toLocaleString()} 
                    growth="0%" 
                    growthText="vs last month" 
                    icon={FiBox} 
                    isNeutral={true} 
                  />
                </motion.div>
                <motion.div variants={fadeInScale}>
                  <StatCard 
                    title="Revenue" 
                    value={`$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    growth="24%" 
                    growthText="vs last month" 
                    icon={FiDollarSign} 
                    isPositive={true} 
                  />
                </motion.div>
              </div>

              {/* Charts Row */}
              <motion.div 
                variants={fadeInScale}
                className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6"
              >
                <div className="min-h-[400px]">
                  <RevenueChart data={revenueData} />
                </div>
                <div className="min-h-[400px]">
                  <OrdersDensityChart data={densityData} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
