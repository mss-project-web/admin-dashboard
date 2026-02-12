"use client";
import { Users, Package, Banknote, TrendingUp, Download } from "lucide-react";
// import { StatsCard } from "@/app/Components/chart/StatsCard";
// import { RevenueChart } from "@/app/Components/chart/RevenueChart";
// import { UsageBarChart } from "@/app/Components/chart/UsageBarChart";
// import { StatusPieChart } from "@/app/Components/chart/StatusPieChart";

export default function AdminDashboard() {
  return (
    <div>
        <h1>Admin Dashboard</h1>
    </div>  
    // <div className="space-y-6">
    //   {/* Header */}
    //   <div className="flex justify-between items-center">
    //     <h2 className="text-xl font-bold">Overview</h2>
    //     <button className="bg-sky-500 text-white p-2 rounded-lg lg:px-4 lg:py-2 text-sm flex items-center gap-2">
    //       <Download size={16} /> <span className="hidden lg:block">Export</span>
    //     </button>
    //   </div>

    //   {/* Stats */}
    //   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    //     <StatsCard label="Users" value="1,250" icon={Users} trend="+12%" colorClass="text-sky-500" bgClass="bg-sky-50" />
    //     <StatsCard label="Bookings" value="48" icon={Package} trend="+5%" colorClass="text-blue-500" bgClass="bg-blue-50" />
    //     <StatsCard label="Revenue" value="฿45.2k" icon={Banknote} trend="+18%" colorClass="text-indigo-500" bgClass="bg-indigo-50" />
    //     <StatsCard label="Active" value="82%" icon={TrendingUp} trend="+2%" colorClass="text-cyan-500" bgClass="bg-cyan-50" />
    //   </div>

    //   {/* Charts */}
    //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    //     <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 shadow-sm">
    //       <h3 className="font-bold mb-4">แนวโน้มรายได้</h3>
    //       <RevenueChart />
    //     </div>
    //     <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 shadow-sm">
    //       <h3 className="font-bold mb-4">ขนาดตู้ยอดนิยม</h3>
    //       <UsageBarChart />
    //     </div>
    //     <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 shadow-sm">
    //       <h3 className="font-bold mb-4 text-center">สถานะตู้</h3>
    //       <StatusPieChart />
    //     </div>
    //   </div>
    // </div>
  );
}