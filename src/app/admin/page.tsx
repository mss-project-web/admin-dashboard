"use client";
import { useEffect, useState } from "react";
import { Users, Package, FileText, Newspaper, Globe, Eye, MousePointerClick, RefreshCw, AlertCircle } from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import { StatsCard } from "@/app/components/chart/StatsCard";
import { LoginActivityChart } from "@/app/components/chart/LoginActivityChart";
import { SystemActivityChart } from "@/app/components/chart/SystemActivityChart";
import { ContentDistributionChart } from "@/app/components/chart/ContentDistributionChart";
import { ContentStatusChart } from "@/app/components/chart/ContentStatusChart";
import { ActionDistributionChart } from "@/app/components/chart/ActionDistributionChart";
import { TopAuthorsChart } from "@/app/components/chart/TopAuthorsChart";
import { DashboardFilterBar } from "@/app/components/DashboardFilterBar";
import { RecentLogsTable } from "@/app/components/RecentLogsTable";
import { PopularContentList } from "@/app/components/PopularContentList";
import { toastUtils } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";

import { Skeleton } from "@/app/components/ui/skeleton";

type PopularGroups = {
  activities: any[];
  blogs: any[];
  news: any[];
};

function normalizePopular(value: unknown): PopularGroups {
  const data = value && !Array.isArray(value) ? value as Record<string, unknown> : {};
  return {
    activities: Array.isArray(data.activities) ? data.activities : [],
    blogs: Array.isArray(data.blogs) ? data.blogs : [],
    news: Array.isArray(data.news) ? data.news : [],
  };
}

function DashboardPanel({ title, error, retry, retrying, children }: { title?: string; error?: string; retry: () => void; retrying: boolean; children: React.ReactNode }) {
  if (error) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
        <AlertCircle className="mb-2 h-6 w-6 text-rose-500" aria-hidden="true" />
        {title && <h3 className="font-bold text-rose-700 dark:text-rose-400">{title}</h3>}
        <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{error}</p>
        <button type="button" onClick={retry} disabled={retrying} aria-label={`Retry ${title || "dashboard section"}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-60">
          <RefreshCw size={15} className={retrying ? "animate-spin" : ""} aria-hidden="true" /> Retry
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [popular, setPopular] = useState<PopularGroups>({ activities: [], blogs: [], news: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [cloudflareAnalytics, setCloudflareAnalytics] = useState<any>(null);
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({});
  const [retryingSection, setRetryingSection] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<{ start?: string; end?: string }>({});
  const [filterReady, setFilterReady] = useState(false);

  // Stable string key so useEffect only fires when the actual dates change, not on reference change
  const dateFilterKey = `${dateFilter.start ?? ''}|${dateFilter.end ?? ''}`;

  const fetchData = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setSectionErrors({});
    try {
      const corePromises = [
        // Summary cards show the total inventory; date filters remain for charts.
        dashboardApi.getSummary(),
        dashboardApi.getDashboardCharts(startDate, endDate),
        dashboardApi.getPopularContent(),
        dashboardApi.getRecentLogsPage(),
      ];

      // Use allSettled so one failing endpoint doesn't block the others
      const [statsRes, chartsRes, popularRes, logsRes] = await Promise.allSettled(corePromises);

      if (statsRes.status === 'fulfilled') {
        const d = statsRes.value as Record<string, unknown>;
        setStats((d.totals as Record<string, unknown>) ?? d);
      } else setSectionErrors((prev) => ({ ...prev, stats: "โหลดสถิติไม่สำเร็จ" }));
      if (chartsRes.status === 'fulfilled') {
        const d = chartsRes.value;
        setCharts(d);
      } else setSectionErrors((prev) => ({ ...prev, charts: "โหลดกราฟไม่สำเร็จ" }));
      if (popularRes.status === 'fulfilled') {
        const d = popularRes.value;
        setPopular(normalizePopular(d));
      } else setSectionErrors((prev) => ({ ...prev, popular: "โหลดเนื้อหายอดนิยมไม่สำเร็จ" }));
      if (logsRes.status === 'fulfilled') {
        const d = logsRes.value as { rows?: unknown[] };
        setLogs((d.rows ?? []) as any[]);
      } else setSectionErrors((prev) => ({ ...prev, logs: "โหลดบันทึกระบบไม่สำเร็จ" }));

      if (isSuperAdmin) {
        dashboardApi.getCloudflareAnalytics().then((res) => {
          setCloudflareAnalytics(res);
        }).catch(() => { /* Cloudflare quota errors are non-critical */ });
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const retrySection = async (section: string) => {
    setRetryingSection(section);
    setSectionErrors((prev) => { const next = { ...prev }; delete next[section]; return next; });
    try {
      if (section === "stats") {
        const d = await dashboardApi.getSummary();
        setStats((d.totals as Record<string, unknown>) ?? d);
      }
      if (section === "charts") setCharts(await dashboardApi.getDashboardCharts(dateFilter.start, dateFilter.end));
      if (section === "popular") {
        const d = await dashboardApi.getPopularContent();
        setPopular(normalizePopular(d));
      }
      if (section === "logs") setLogs((await dashboardApi.getRecentLogsPage()).rows as any[]);
      if (section === "cloudflare") setCloudflareAnalytics(await dashboardApi.getCloudflareAnalytics());
    } catch {
      setSectionErrors((prev) => ({ ...prev, [section]: "โหลดข้อมูลไม่สำเร็จ" }));
    } finally {
      setRetryingSection(null);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!filterReady) return;
    fetchData(dateFilter.start, dateFilter.end);
  }, [isSuperAdmin, dateFilterKey, filterReady]); // use stable key string, not object reference

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h2>
      </div>

      <DashboardFilterBar 
        onFilterChange={(start, end) => {
          setDateFilter({ start, end });
          setFilterReady(true);
        }}
      />

      {loading ? (
        <div className="space-y-6">
          {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col p-6 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
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

        {/* Charts & Analytics Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Login Activity Skeleton */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>

          {/* System Activity Skeleton */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </div>
        </div>

        {/* Analytics Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="flex justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Logs Skeleton */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
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
      ) : (
        <>
      {/* Cloudflare Analytics - SuperAdmin Only */}
      {isSuperAdmin && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatsCard label="Total Requests" value={cloudflareAnalytics?.totalRequests ?? 0} icon={MousePointerClick} />
            <StatsCard label="Total Page Views" value={cloudflareAnalytics?.totalPageViews ?? 0} icon={FileText} />
            <StatsCard label="Unique Visitors" value={cloudflareAnalytics?.totalUniqueVisitors ?? 0} icon={Eye} />
          </div>
      )}

      {/* Stats */}
      <DashboardPanel title="สถิติ" error={sectionErrors.stats} retry={() => retrySection("stats")} retrying={retryingSection === "stats"}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatsCard label="Users" value={stats?.users || 0} icon={Users} />
          <StatsCard label="Activities" value={stats?.activities || 0} icon={Package} />
          <StatsCard label="News" value={stats?.news || 0} icon={Newspaper} />
          <StatsCard label="Blogs" value={stats?.blogs || 0} icon={FileText} />
          <StatsCard label="Prayer Rooms" value={stats?.prayerRooms || 0} icon={Globe} />
        </div>
      </DashboardPanel>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardPanel title="กราฟกิจกรรมระบบ" error={sectionErrors.charts} retry={() => retrySection("charts")} retrying={retryingSection === "charts"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">System Activity</h3>
            <SystemActivityChart data={charts?.systemActivity || []} />
          </div>
        </DashboardPanel>
        <DashboardPanel title="กราฟการเข้าสู่ระบบ" error={sectionErrors.charts} retry={() => retrySection("charts")} retrying={retryingSection === "charts"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Login Activity</h3>
            <LoginActivityChart data={charts?.loginActivity || []} />
          </div>
        </DashboardPanel>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DashboardPanel title="ประเภทเนื้อหา" error={sectionErrors.charts} retry={() => retrySection("charts")} retrying={retryingSection === "charts"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Content Types</h3>
            <ContentDistributionChart data={charts?.contentDistribution || []} />
          </div>
        </DashboardPanel>
        <DashboardPanel title="สถานะเนื้อหา" error={sectionErrors.charts} retry={() => retrySection("charts")} retrying={retryingSection === "charts"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Content Status</h3>
            <ContentStatusChart data={charts?.contentStatus || []} />
          </div>
        </DashboardPanel>
        <DashboardPanel title="การกระทำในระบบ" error={sectionErrors.charts} retry={() => retrySection("charts")} retrying={retryingSection === "charts"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Action Distribution</h3>
            <ActionDistributionChart data={charts?.actionDistribution || []} />
          </div>
        </DashboardPanel>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Top Authors</h3>
          <TopAuthorsChart data={charts?.topAuthors || []} />
        </div>
        <DashboardPanel title="Popular Activities" error={sectionErrors.popular} retry={() => retrySection("popular")} retrying={retryingSection === "popular"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Popular Activities</h3>
            <PopularContentList content={popular.activities} />
          </div>
        </DashboardPanel>
        <DashboardPanel title="Popular Blogs" error={sectionErrors.popular} retry={() => retrySection("popular")} retrying={retryingSection === "popular"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Popular Blogs</h3>
            <PopularContentList content={popular.blogs.map((item) => ({ ...item, name_th: item.title, name_eng: item.slug, images: item.coverImage ? [item.coverImage] : [] }))} />
          </div>
        </DashboardPanel>
        <DashboardPanel title="Popular News" error={sectionErrors.popular} retry={() => retrySection("popular")} retrying={retryingSection === "popular"}>
          <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Popular News</h3>
            <PopularContentList content={popular.news.map((item) => ({ ...item, name_th: item.name, name_eng: item.description, images: item.images || [] }))} />
          </div>
        </DashboardPanel>
      </div>


      {/* Recent Logs Section */}
      {isSuperAdmin && (
        <DashboardPanel title="Recent System Logs" error={sectionErrors.logs} retry={() => retrySection("logs")} retrying={retryingSection === "logs"}>
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Recent System Logs</h3>
          <RecentLogsTable logs={logs} />
        </div>
        </DashboardPanel>
      )}
        </>
      )}
    </div>
  );
}
