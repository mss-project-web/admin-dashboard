"use client";
import { useEffect, useState } from "react";
import { Users, Package, Banknote, TrendingUp, Download, FileText, Newspaper, Church } from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import { StatsCard } from "@/app/components/chart/StatsCard";
import { LoginActivityChart } from "@/app/components/chart/LoginActivityChart";
import { ContentDistributionChart } from "@/app/components/chart/ContentDistributionChart";
import { RecentLogsTable } from "@/app/components/RecentLogsTable";
import { PopularContentList } from "@/app/components/PopularContentList";
import { toastUtils } from "@/lib/toast";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [popular, setPopular] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes, popularRes, logsRes] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getCharts(),
          dashboardApi.getPopularContent(),
          dashboardApi.getRecentLogs()
        ]);

        // Adjust based on actual API response structure (checking response wrapper)
        setStats(statsRes.data?.data || statsRes.data || statsRes);
        setCharts(chartsRes.data?.data || chartsRes.data || chartsRes);

        // Popular content might be inside a 'data' array in 'data' object
        const popularData = popularRes.data?.data?.activities || popularRes.data?.activities || popularRes.data || [];
        setPopular(popularData);

        const logsData = logsRes.data?.data || logsRes.data || [];
        setLogs(logsData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูล Dashboard ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h2>
        {/* <button className="bg-sky-500 hover:bg-sky-600 transition-colors text-white p-2 rounded-lg lg:px-4 lg:py-2 text-sm flex items-center gap-2">
                    <Download size={16} /> <span className="hidden lg:block">Export</span>
                </button> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Users"
          value={stats?.users || 0}
          icon={Users}
          trend=""
          colorClass="text-sky-500"
          bgClass="bg-sky-50 dark:bg-sky-900/20"
        />
        <StatsCard
          label="Activities"
          value={stats?.activities || 0}
          icon={Package}
          trend=""
          colorClass="text-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatsCard
          label="News"
          value={stats?.news || 0}
          icon={Newspaper}
          trend=""
          colorClass="text-purple-500"
          bgClass="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatsCard
          label="Blogs"
          value={stats?.blogs || 0}
          icon={FileText}
          trend=""
          colorClass="text-orange-500"
          bgClass="bg-orange-50 dark:bg-orange-900/20"
        />
      </div>

      {/* Charts & Popular Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Login Activity - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Login Activity</h3>
          <LoginActivityChart data={charts?.loginActivity || []} />
        </div>

        {/* Popular Content */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Popular Activities</h3>
          <PopularContentList content={popular} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Distribution (Pie) */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 text-center text-slate-900 dark:text-white">Content Distribution</h3>
          <ContentDistributionChart data={charts?.contentDistribution || []} />
        </div>

        {/* Recent Logs - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Recent System Logs</h3>
          <RecentLogsTable logs={logs} />
        </div>
      </div>
    </div>
  );
}