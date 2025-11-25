import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
} from 'recharts';
import MetricCard from './MetricCard';

type PerItem = { _id: string | null; count: number };

const ranges = [
  { label: 'Today', days: 1 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'All Time', days: 0 },
];

const UserActivityAnalytics: React.FC = () => {
  const { token } = useAuth();
  const [days, setDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [perPage, setPerPage] = useState<PerItem[]>([]);
  const [perEvent, setPerEvent] = useState<PerItem[]>([]);
  const [timeSeries, setTimeSeries] = useState<any[]>([]); // aggregated
  const [rawSeries, setRawSeries] = useState<any[]>([]); // original timeSeries from API
  const [error, setError] = useState<string>('');
  const [chartView, setChartView] = useState<'total' | 'bar' | 'perPage'>('total');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<any[]>([]);
  const [liveCount, setLiveCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        // fetch graphs and summary from new activity API
        const base = 'https://ecommerce-fashion-app-som7.vercel.app';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [graphsRes, summaryRes] = await Promise.all([
          fetch(`${base}/api/activity/graphs?days=${days}`, { headers }),
          fetch(`${base}/api/activity/summary?days=${days}`, { headers }),
        ]);

        if (!graphsRes.ok) throw new Error('Failed to fetch graphs');
        if (!summaryRes.ok) throw new Error('Failed to fetch summary');

        const graphsJson = await graphsRes.json();
        const summaryJson = await summaryRes.json();
        const graphs = graphsJson.data || [];
        const summary = summaryJson.data || {};

        // graphs is array of { _id: day, events, byType }
        // Normalize to shape used by Overview's analytics chart: { day, events, pages, productViews }
        const normalized = (graphs || []).map((g: any) => {
          const byTypeArr: Array<{ k: string; v: number }> = Array.isArray(g.byType) ? g.byType : [];
          const byType: Record<string, number> = {};
          byTypeArr.forEach((it: any) => {
            if (it && (it.k || it._id)) {
              const key = it.k || it._id || String(it.eventType || '');
              const val = Number(it.v || it.v === 0 ? it.v : it.count || 0) || 0;
              byType[key] = (byType[key] || 0) + val;
            }
          });
          const pages = byType['page_view'] || 0;
          const productViews = byType['product_view'] || 0;
          return { day: g._id, events: Number(g.events || 0), pages, productViews, byType };
        });
        setTimeSeries(normalized);
        // build rawSeries for per-page breakdown if available (compat)
        // older shape had timeSeries entries; we keep perEvent and perPage minimal
        setRawSeries([]);
        setPerPage([]);
        setPerEvent(summary ? Object.entries(summary).map(([k, v]) => ({ _id: k, count: v as number })) : []);

        // timeSeries already mapped above from /api/activity/graphs
      } catch (err: any) {
        setError(err.message || 'Failed to load');
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
    const base = 'https://ecommerce-fashion-app-som7.vercel.app';
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
        console.warn('Activity SSE error', err);
        try { es && es.close(); } catch (e) {}
        es = null;
      };
    } catch (e) {
      console.warn('Failed to open activity SSE', e);
    }

    return () => {
      try { es && es.close(); } catch (e) {}
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
      const page = it._id.page || 'unknown';
      pageTotals[page] = (pageTotals[page] || 0) + (it.count || 0);
    });
    const sortedPages = Object.keys(pageTotals).sort((a, b) => pageTotals[b] - pageTotals[a]);

    // build per-day series objects with page keys
    const series: any[] = daysArr.map((d) => ({ day: d }));
    rawSeries.forEach((it: any) => {
      const d = it._id.day;
      const p = it._id.page || 'unknown';
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
    const totalEvents = (perEvent || []).reduce((s, e) => s + (e.count || 0), 0);
    const uniquePages = (perPage || []).length;
    const uniqueEvents = (perEvent || []).length;
    const maxEventCount = (perEvent || []).reduce((m, e) => Math.max(m, e.count || 0), 0);
    return { totalEvents, uniquePages, uniqueEvents, maxEventCount };
  }, [perEvent, perPage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Activity Analytics</h1>
          <p className="text-sm text-gray-600">Page visits and event counts</p>
        </div>
        <div className="flex items-center space-x-2">
          {ranges.map((r) => (
            <button
              key={r.label}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1 rounded ${days === r.days ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : error ? (
        <div className="py-6 text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Events"
              value={`${totals.totalEvents.toLocaleString()}`}
              icon="TrendingUp"
            />
            <MetricCard
              title="Pages Tracked"
              value={`${totals.uniquePages}`}
              icon="BarChart3"
            />
            <MetricCard
              title="Event Types"
              value={`${totals.uniqueEvents}`}
              icon="Users"
            />
            <MetricCard
              title="Avg / Day"
              value={`${Math.round(totals.totalEvents / Math.max(1, (timeSeries || []).length))}`}
              icon="Target"
            />
          </div>

          {/* Realtime Panel */}
          <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Live Activity</h3>
              <div className="text-sm text-gray-600">Live events: <span className="font-medium">{realtimeEvents.length}</span></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1 p-3 rounded">
                <div className="text-sm text-gray-500">Approx Live Count</div>
                <div className="text-2xl font-bold">{liveCount}</div>
              </div>
              <div className="md:col-span-3">
                <div className="text-sm text-gray-600 mb-2">Recent Events (stream)</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm table-auto">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="px-2">Time</th>
                        <th className="px-2">Event</th>
                        <th className="px-2">Page</th>
                        <th className="px-2">Product</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realtimeEvents.map((e, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1 text-xs text-gray-500">{new Date(e.data?.timestamp || Date.now()).toLocaleTimeString()}</td>
                          <td className="px-2 py-1">{e.data?.eventType || e.type || 'activity'}</td>
                          <td className="px-2 py-1">{e.data?.page || '-'}</td>
                          <td className="px-2 py-1">{e.data?.productId || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Activity Over Time</h3>
              <div className="inline-flex rounded-md shadow-sm" role="tablist" aria-label="Chart view">
                <button
                  onClick={() => setChartView('total')}
                  className={`px-3 py-1 rounded ${chartView === 'total' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Total
                </button>
                <button
                  onClick={() => setChartView('bar')}
                  className={`px-3 py-1 rounded ${chartView === 'bar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Bar
                </button>
                <button
                  onClick={() => setChartView('perPage')}
                  className={`px-3 py-1 rounded ${chartView === 'perPage' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Per Page
                </button>
              </div>
            </div>

            <div style={{ width: '100%', height: 320 }}>
              {((timeSeries || []).length === 0) ? (
                <div className="flex items-center justify-center h-full text-gray-400 border-dashed border-2 border-neutral-border/40 rounded-md">
                  No activity data for the selected range — no events to display.
                </div>
              ) : (
                <ResponsiveContainer>
                {(() => {
                  // total area chart
                  if (chartView === 'total') {
                    return (
                      <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FB923C" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(value: any, name: any) => [value, typeof name === 'string' && name === 'events' ? 'Events' : name]} />
                        <Area type="monotone" dataKey="events" stroke="#FB923C" fill="url(#colorEvents)" strokeWidth={2} dot={{ r: 3 }} />
                        {/* productViews as a line to complement events */}
                        <Line type="monotone" dataKey="productViews" stroke="#F97316" strokeWidth={2} dot={false} />
                        <Legend />
                      </AreaChart>
                    );
                  }

                  // bar chart
                  if (chartView === 'bar') {
                    return (
                      <BarChart data={timeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(v:any) => [v, 'Events']} />
                        <Bar dataKey="events" fill="#3B82F6" />
                      </BarChart>
                    );
                  }

                  // per-page lines
                  return (
                    <LineChart data={perDaySeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      {/* render selected pages as lines */}
                      {selectedPages.map((p, idx) => (
                        <Line key={p} type="monotone" dataKey={p} stroke={["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"][idx % 5]} dot={false} />
                      ))}
                    </LineChart>
                  );
                })()}
                </ResponsiveContainer>
              )}
            </div>

            {/* page selector for per-page view */}
            {chartView === 'perPage' && (
              <div className="mt-3">
                <div className="text-sm text-gray-600 mb-2">Pages (toggle to show on chart)</div>
                <div className="flex flex-wrap gap-2">
                  {topPages.slice(0, 12).map((p) => {
                    const active = selectedPages.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          if (active) setSelectedPages((s) => s.filter((x) => x !== p));
                          else setSelectedPages((s) => [...s, p]);
                        }}
                        className={`px-3 py-1 rounded text-sm ${active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border p-4">
            <h3 className="font-semibold mb-2">Events Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(perEvent || []).map((e) => {
                  const pct = totals.maxEventCount > 0 ? Math.round(((e.count || 0) / totals.maxEventCount) * 100) : 0;
                  return (
                    <div key={String(e._id)} className="p-2 border rounded bg-white">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm text-gray-600">{e._id}</div>
                        <div className="text-sm font-medium">{e.count}</div>
                      </div>
                      <div className="w-full bg-gray-100 rounded h-2">
                        <div className="h-2 rounded bg-primary-600" style={{ width: `${pct}%` }} />
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
