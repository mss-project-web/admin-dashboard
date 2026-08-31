"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ContentDistributionChartProps {
    data: any[];
}

const COLORS = ['#1e3a8a', '#1d4ed8', '#3b82f6', '#93c5fd', '#64748b'];

export const ContentDistributionChart = ({ data }: ContentDistributionChartProps) => {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            backgroundColor: '#ffffff',
                            padding: '8px 12px'
                        }}
                        itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '14px' }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="left"
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span style={{ color: '#475569', fontSize: '13px', fontWeight: 600, marginLeft: '4px' }}>
                                {value} <span style={{ color: '#94a3b8', marginLeft: '4px' }}>{entry.payload?.value}</span>
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
