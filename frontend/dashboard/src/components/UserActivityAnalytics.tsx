import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import MetricCard from "./MetricCard";

type PerItem = { _id: string | null; count: number };

const ranges = [
  { label: "Today", days: 1 },
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "All Time", days: 0 },
];

const UserActivityAnalytics: React.FC = () => {
  const { token } = useAuth();
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState<PerItem[]>([]);
  const [perEvent, setPerEvent] = useState<PerItem[]>([]);
  const [timeSeries, setTimeSeries] = useState<any[]>([]); // aggregated
  const [rawSeries, setRawSeries] = useState<any[]>([]); // original timeSeries from API
  const [error, setError] = useState<string>("");
  const [chartView, setChartView] = useState<"total" | "bar" | "perPage">(
    "total"
  );
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [liveCount, setLiveCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        // fetch graphs and summary from new activity API
        const base = "http://localhost:3500";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [graphsRes, summaryRes] = await Promise.all([
          fetch(`${base}/api/activity/graphs?days=${days}`, { 
            headers,
            credentials: 'include',
          }),
          fetch(`${base}/api/activity/summary?days=${days}`, { 
            headers,
            credentials: 'include',
          }),
        ]);

        if (!graphsRes.ok) {
          const errorData = await graphsRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch graphs (${graphsRes.status})`);
        }
        if (!summaryRes.ok) {
          const errorData = await summaryRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch summary (${summaryRes.status})`);
        }

        const graphsJson = await graphsRes.json();
        const summaryJson = await summaryRes.json();
        const graphs = graphsJson.data || [];
        const summary = summaryJson.data || {};

        // graphs is array of { _id: day, events, byType }
        // Normalize to shape used by Overview's analytics chart: { day, events, pages, productViews }
        const normalized = (graphs || []).map((g: any) => {
          const byTypeArr: Array<{ k: string; v: number }> = Array.isArray(
            g.byType
          )
            ? g.byType
            : [];
          const byType: Record<string, number> = {};
          byTypeArr.forEach((it: any) => {
            if (it && (it.k || it._id)) {
              const key = it.k || it._id || String(it.eventType || "");
              const val =
                Number(it.v || it.v === 0 ? it.v : it.count || 0) || 0;
              byType[key] = (byType[key] || 0) + val;
            }
          });
          const pages = byType["page_view"] || 0;
          const productViews = byType["product_view"] || 0;
          return {
            day: g._id,
            events: Number(g.events || 0),
            pages,
            productViews,
            byType,
          };
        });
        setTimeSeries(normalized);
        // build rawSeries for per-page breakdown if available (compat)
        // older shape had timeSeries entries; we keep perEvent and perPage minimal
        setRawSeries([]);
        setPerPage([]);
        setPerEvent(
          summary
            ? Object.entries(summary).map(([k, v]) => ({
                _id: k,
                count: v as number,
              }))
            : []
        );

        // timeSeries already mapped above from /api/activity/graphs
      } catch (err: any) {
        console.error('Activity fetch error:', err);
        setError(err.message || "Failed to load activity data. Please check your permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, days]);

  // SSE realtime listener (best-effort). Streams events from the server and
  // maintains a short recent-events list for the live UI. The stream is public
  // and does not require a bearer header (EventSource cannot send custom headers).
  useEffect(() => {
    const base = "http://localhost:3500";
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${base}/api/activity/stream`);
      es.onmessage = (ev) => {
        try {
          const parsed = JSON.parse(ev.data);
          // keep most recent 100 events
          setRealtimeEvents((prev) => [parsed].concat(prev).slice(0, 100));
          // simple live count approximation (unique sessions in recent events)
          setLiveCount((prev) => Math.min(9999, prev + 1));
        } catch (e) {
          // ignore parse errors
        }
      };
      es.onerror = (err) => {
        // If the connection fails, close and allow retry by recreating
        console.warn("Activity SSE error", err);
        try {
          es && es.close();
        } catch (e) {}
        es = null;
      };
    } catch (e) {
      console.warn("Failed to open activity SSE", e);
    }

    return () => {
      try {
        es && es.close();
      } catch (e) {}
    };
  }, []);

  // derive per-day series and per-page series map
  const { perDaySeries, topPages } = useMemo(() => {
    // collect all days
    const daysSet = new Set<string>();
    rawSeries.forEach((it: any) => daysSet.add(it._id.day));
    const daysArr = Array.from(daysSet).sort();

    // collect pages
    const pageTotals: Record<string, number> = {};
    rawSeries.forEach((it: any) => {
      const page = it._id.page || "unknown";
      pageTotals[page] = (pageTotals[page] || 0) + (it.count || 0);
    });
    const sortedPages = Object.keys(pageTotals).sort(
      (a, b) => pageTotals[b] - pageTotals[a]
    );

    // build per-day series objects with page keys
    const series: any[] = daysArr.map((d) => ({ day: d }));
    rawSeries.forEach((it: any) => {
      const d = it._id.day;
      const p = it._id.page || "unknown";
      const idx = series.findIndex((s) => s.day === d);
      if (idx >= 0) {
        series[idx][p] = (series[idx][p] || 0) + (it.count || 0);
      }
    });

    return { perDaySeries: series, topPages: sortedPages };
  }, [rawSeries]);

  // if no selection, default to top 3 pages
  useEffect(() => {
    if (selectedPages.length === 0 && topPages && topPages.length > 0) {
      setSelectedPages(topPages.slice(0, 3));
    }
  }, [topPages]);

  const totals = useMemo(() => {
    const totalEvents = (perEvent || []).reduce(
      (s, e) => s + (e.count || 0),
      0
    );
    const uniquePages = (perPage || []).length;
    const uniqueEvents = (perEvent || []).length;
    const maxEventCount = (perEvent || []).reduce(
      (m, e) => Math.max(m, e.count || 0),
      0
    );
    return { totalEvents, uniquePages, uniqueEvents, maxEventCount };
  }, [perEvent, perPage]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            User Activity Analytics
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Track page visits, user interactions, and engagement metrics in
            real-time
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                days === r.days
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity data...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Activity Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-100">
                  Total Events
                </h3>
                <svg
                  className="w-8 h-8 text-blue-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold">
                {totals.totalEvents.toLocaleString()}
              </div>
              <div className="text-xs text-blue-100 mt-2">
                All tracked interactions
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-100">
                  Pages Tracked
                </h3>
                <svg
                  className="w-8 h-8 text-green-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold">{totals.uniquePages}</div>
              <div className="text-xs text-green-100 mt-2">
                Unique pages visited
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-100">
                  Event Types
                </h3>
                <svg
                  className="w-8 h-8 text-purple-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold">{totals.uniqueEvents}</div>
              <div className="text-xs text-purple-100 mt-2">
                Different event categories
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-100">
                  Avg / Day
                </h3>
                <svg
                  className="w-8 h-8 text-orange-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="text-3xl font-bold">
                {Math.round(
                  totals.totalEvents / Math.max(1, (timeSeries || []).length)
                )}
              </div>
              <div className="text-xs text-orange-100 mt-2">
                Average daily events
              </div>
            </div>
          </div>

          {/* Realtime Panel */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Live Activity
              </h3>
              <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                Live events:{" "}
                <span className="font-bold text-green-700">
                  {realtimeEvents.length}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-700">
                  Approx Live Users
                </div>
                <div className="text-4xl font-bold text-green-600 mt-2">
                  {liveCount}
                </div>
                <div className="text-xs text-green-600 mt-1">Active now</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-sm font-semibold text-gray-700 mb-3">
                  Recent Events Stream
                </div>
                <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr className="text-left text-gray-700">
                        <th className="px-4 py-3 font-semibold">Time</th>
                        <th className="px-4 py-3 font-semibold">Event</th>
                        <th className="px-4 py-3 font-semibold">Page</th>
                        <th className="px-4 py-3 font-semibold">Product</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {realtimeEvents.slice(0, 10).map((e, i) => (
                        <tr
                          key={i}
                          className="hover:bg-white transition-colors"
                        >
                          <td className="px-4 py-2 text-xs text-gray-600 font-mono">
                            {new Date(
                              e.data?.timestamp || Date.now()
                            ).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {e.data?.eventType || e.type || "activity"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {e.data?.page || "-"}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {e.data?.productId || "-"}
                          </td>
                        </tr>
                      ))}
                      {realtimeEvents.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            <svg
                              className="w-12 h-12 mx-auto mb-2 text-gray-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Waiting for live events...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Activity Over Time
              </h3>
              <div
                className="inline-flex rounded-lg border border-gray-300 overflow-hidden"
                role="tablist"
                aria-label="Chart view"
              >
                <button
                  onClick={() => setChartView("total")}
                  className={`px-4 py-2 font-medium transition-all duration-200 ${
                    chartView === "total"
                      ? "bg-blue-600 text-white shadow-inner"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Total
                </button>
                <button
                  onClick={() => setChartView("bar")}
                  className={`px-4 py-2 font-medium transition-all duration-200 border-l border-gray-300 ${
                    chartView === "bar"
                      ? "bg-blue-600 text-white shadow-inner"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartView("perPage")}
                  className={`px-4 py-2 font-medium transition-all duration-200 border-l border-gray-300 ${
                    chartView === "perPage"
                      ? "bg-blue-600 text-white shadow-inner"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Per Page
                </button>
              </div>
            </div>

            <div style={{ width: "100%", height: 320 }}>
              {(timeSeries || []).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 border-dashed border-2 border-neutral-border/40 rounded-md">
                  No activity data for the selected range — no events to
                  display.
                </div>
              ) : (
                <ResponsiveContainer>
                  {(() => {
                    // total area chart
                    if (chartView === "total") {
                      return (
                        <AreaChart
                          data={timeSeries}
                          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorEvents"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#FB923C"
                                stopOpacity={0.18}
                              />
                              <stop
                                offset="95%"
                                stopColor="#FB923C"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorPages"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#F97316"
                                stopOpacity={0.12}
                              />
                              <stop
                                offset="95%"
                                stopColor="#F97316"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip
                            formatter={(value: any, name: any) => [
                              value,
                              typeof name === "string" && name === "events"
                                ? "Events"
                                : name,
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="events"
                            stroke="#FB923C"
                            fill="url(#colorEvents)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          {/* productViews as a line to complement events */}
                          <Line
                            type="monotone"
                            dataKey="productViews"
                            stroke="#F97316"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Legend />
                        </AreaChart>
                      );
                    }

                    // bar chart
                    if (chartView === "bar") {
                      return (
                        <BarChart
                          data={timeSeries}
                          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip formatter={(v: any) => [v, "Events"]} />
                          <Bar dataKey="events" fill="#3B82F6" />
                        </BarChart>
                      );
                    }

                    // per-page lines
                    return (
                      <LineChart
                        data={perDaySeries}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        {/* render selected pages as lines */}
                        {selectedPages.map((p, idx) => (
                          <Line
                            key={p}
                            type="monotone"
                            dataKey={p}
                            stroke={
                              [
                                "#3B82F6",
                                "#10B981",
                                "#8B5CF6",
                                "#F59E0B",
                                "#EF4444",
                              ][idx % 5]
                            }
                            dot={false}
                          />
                        ))}
                      </LineChart>
                    );
                  })()}
                </ResponsiveContainer>
              )}
            </div>

            {/* page selector for per-page view */}
            {chartView === "perPage" && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">
                  Pages (toggle to show on chart)
                </div>
                <div className="flex flex-wrap gap-2">
                  {topPages.slice(0, 12).map((p) => {
                    const active = selectedPages.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          if (active)
                            setSelectedPages((s) => s.filter((x) => x !== p));
                          else setSelectedPages((s) => [...s, p]);
                        }}
                        className={`px-3 py-1 rounded text-sm ${
                          active
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Events Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(perEvent || []).map((e) => {
                const pct =
                  totals.maxEventCount > 0
                    ? Math.round(((e.count || 0) / totals.maxEventCount) * 100)
                    : 0;
                return (
                  <div
                    key={String(e._id)}
                    className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-700 capitalize">
                        {e._id}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {e.count.toLocaleString()}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {pct}% of max
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserActivityAnalytics;
