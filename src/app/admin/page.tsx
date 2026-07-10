"use client";
import { useEffect, useState } from "react";
import { Users, Package, FileText, Newspaper, Globe, Eye, MousePointerClick } from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import { StatsCard } from "@/app/components/chart/StatsCard";
import { LoginActivityChart } from "@/app/components/chart/LoginActivityChart";
import { ContentDistributionChart } from "@/app/components/chart/ContentDistributionChart";
import { RecentLogsTable } from "@/app/components/RecentLogsTable";
import { PopularContentList } from "@/app/components/PopularContentList";
import { toastUtils } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";

import { Skeleton } from "@/app/components/ui/skeleton";

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [popular, setPopular] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [cloudflareAnalytics, setCloudflareAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          dashboardApi.getStats(),
          dashboardApi.getCharts(),
          dashboardApi.getPopularContent(),
          dashboardApi.getRecentLogs()
        ];

        if (isSuperAdmin) {
          promises.push(dashboardApi.getCloudflareAnalytics());
        }

        const results = await Promise.all(promises);
        const [statsRes, chartsRes, popularRes, logsRes, cloudflareRes] = results;

        setStats(statsRes.data?.data || statsRes.data || statsRes);
        setCharts(chartsRes.data?.data || chartsRes.data || chartsRes);

        const popularData = popularRes.data?.data?.activities || popularRes.data?.activities || popularRes.data || [];
        setPopular(popularData);

        const logsData = logsRes.data?.data || logsRes.data || [];
        setLogs(logsData);

        if (isSuperAdmin && cloudflareRes) {
          setCloudflareAnalytics(cloudflareRes.data?.data || cloudflareRes.data || null);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toastUtils.error("เกิดข้อผิดพลาด", "ไม่สามารถโหลดข้อมูล Dashboard ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col p-6 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Popular Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Login Activity Skeleton */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>

          {/* Popular Content Skeleton */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Distribution Skeleton */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-center">
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex justify-center py-4">
              <Skeleton className="h-[250px] w-[250px] rounded-full" />
            </div>
          </div>

          {/* Recent Logs Skeleton */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-[2rem] border border-sky-50 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1 max-w-[200px]">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h2>
      </div>

      {/* Cloudflare Analytics - SuperAdmin Only */}
      {isSuperAdmin && cloudflareAnalytics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2">
                <MousePointerClick size={16} />
                <span>Total Requests</span>
              </div>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {cloudflareAnalytics.totalRequests?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2">
                <FileText size={16} />
                <span>Total Page Views</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {cloudflareAnalytics.totalPageViews?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-2">
                <Eye size={16} />
                <span>Unique Visitors</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {cloudflareAnalytics.totalUniqueVisitors?.toLocaleString() || 0}
              </p>
            </div>
          </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 ">
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