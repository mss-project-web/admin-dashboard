"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoginActivityChartProps {
    data: any[];
}

export const LoginActivityChart = ({ data }: LoginActivityChartProps) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorLogin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="_id"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            backgroundColor: '#ffffff',
                            padding: '12px'
                        }}
                        labelStyle={{ color: '#64748b', marginBottom: '8px', fontSize: '12px', fontWeight: 500 }}
                        itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '14px' }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                        formatter={(value: number | undefined) => [value ?? 0, 'Logins']}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#1d4ed8"
                        strokeWidth={3}
                        fill="url(#colorLogin)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#1e40af' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
