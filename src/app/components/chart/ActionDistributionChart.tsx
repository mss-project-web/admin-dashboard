"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ActionDistributionChartProps {
    data: any[];
}

export const ActionDistributionChart = ({ data }: ActionDistributionChartProps) => {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis 
                        dataKey="action" 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                        name="System Actions"
                        dataKey="count"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            backgroundColor: '#ffffff',
                            padding: '8px 12px'
                        }}
                        itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '14px' }}
                        labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};
