"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoginActivityChartProps {
    data: any[];
}

export const LoginActivityChart = ({ data }: LoginActivityChartProps) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorSky" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(8px)',
                            padding: '12px 16px'
                        }}
                        labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                        itemStyle={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        fill="url(#colorSky)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
