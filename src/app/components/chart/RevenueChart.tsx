"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', income: 4000 }, { name: 'Tue', income: 3000 },
  { name: 'Wed', income: 5000 }, { name: 'Thu', income: 2780 },
  { name: 'Fri', income: 6890 }, { name: 'Sat', income: 8390 },
  { name: 'Sun', income: 9490 },
];

export const RevenueChart = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
        <YAxis hide />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
        <Area type="monotone" dataKey="income" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorSky)" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);