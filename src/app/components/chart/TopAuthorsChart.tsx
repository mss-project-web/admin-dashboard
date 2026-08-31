"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TopAuthorsChartProps {
    data: any[];
}

export const TopAuthorsChart = ({ data }: TopAuthorsChartProps) => {
    if (data.length === 0) {
        return (
            <div className="flex h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center dark:border-slate-800 dark:bg-slate-900/30">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">ยังไม่มีข้อมูลผู้เขียน</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">บทความที่มีผู้เขียนจะแสดงที่นี่</p>
            </div>
        );
    }

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            backgroundColor: '#ffffff',
                            padding: '8px 12px'
                        }}
                        itemStyle={{ color: '#0f172a', fontWeight: 700, fontSize: '14px' }}
                        formatter={(value: number | undefined) => [value ?? 0, 'Posts']}
                    />
                    <Bar 
                        dataKey="count" 
                        fill="#3b82f6" 
                        radius={[0, 4, 4, 0]}
                        maxBarSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
