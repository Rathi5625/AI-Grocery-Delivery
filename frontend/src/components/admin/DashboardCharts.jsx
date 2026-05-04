import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { FiMoreHorizontal } from 'react-icons/fi';

const revenueData = [
  { day: 'Mon', value: 12000, color: '#E5DFD6' },
  { day: 'Tue', value: 22000, color: '#E5DFD6' },
  { day: 'Wed', value: 18000, color: '#E5DFD6' },
  { day: 'Thu', value: 42000, color: '#D6B588' },
  { day: 'Fri', value: 32000, color: '#E5DFD6' },
  { day: 'Sat', value: 50000, color: '#E5DFD6' },
  { day: 'Sun', value: 65000, color: '#705E46' },
];

const densityData = [
  { time: '1', value: 25 },
  { time: '2', value: 28 },
  { time: '3', value: 22 },
  { time: '4', value: 25 },
  { time: '5', value: 55 },
  { time: '6', value: 85 },
  { time: '7', value: 80 },
  { time: '8', value: 82 },
];

const CustomizedDot = (props) => {
  const { cx, cy, index } = props;
  if (index === 4) {
    return (
      <circle cx={cx} cy={cy} r={4} stroke="#705E46" strokeWidth={3} fill="#FDFBF7" />
    );
  }
  return null;
};

export function RevenueChart({ data }) {
  const chartData = data && data.length > 0 ? data : revenueData;
  return (
    <div className="bg-[#FDFBF7] p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(198,192,185,0.3)] border border-[#C6C0B9]/20 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[1.3rem] font-medium text-[#422701]">Revenue Growth</h3>
        <button className="text-[#705E46] hover:text-[#422701] transition-colors">
          <FiMoreHorizontal size={24} />
        </button>
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={50} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#EAE5DA" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A89F91', fontSize: 12 }} 
              dy={10} 
              tickFormatter={(val) => val === 'Thu' ? val : ''} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#A89F91', fontSize: 12 }} 
              dx={-10} 
              tickFormatter={(val) => val === 0 ? '0' : `$${val/1000}k`} 
              domain={[0, 50000]}
              ticks={[0, 10000, 20000, 30000, 40000, 50000]}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#E5DFD6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function OrdersDensityChart({ data }) {
  const chartData = data && data.length > 0 ? data : densityData;
  return (
    <div className="bg-[#FDFBF7] p-8 rounded-xl shadow-[0_4px_20px_-4px_rgba(198,192,185,0.3)] border border-[#C6C0B9]/20 w-full h-full flex flex-col">
      <h3 className="text-[1.3rem] font-medium text-[#422701] mb-6">Orders Density</h3>
      <div className="flex-1 min-h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D6B588" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D6B588" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#EAE5DA" horizontalPoints={[40, 80, 120, 160]} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#705E46" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorDensity)" 
              dot={<CustomizedDot />}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
