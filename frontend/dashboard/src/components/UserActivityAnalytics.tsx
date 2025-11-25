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
        setTimeSeries((graphs || []).map((g: any) => ({ day: g._id, events: g.events, byType: g.byType })));
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
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Total Events</div>
              <div className="text-2xl font-bold">{totals.totalEvents.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Pages Tracked</div>
              <div className="text-2xl font-bold">{totals.uniquePages}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Event Types</div>
              <div className="text-2xl font-bold">{totals.uniqueEvents}</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm text-gray-500">Avg / Day</div>
              <div className="text-2xl font-bold">{Math.round(totals.totalEvents / Math.max(1, (timeSeries || []).length))}</div>
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
                        <Tooltip formatter={(value: any, name: any) => [value, name === 'events' ? 'Events' : 'Pages']} />
                        <Area type="monotone" dataKey="events" stroke="#FB923C" fill="url(#colorEvents)" strokeWidth={2} dot={{ r: 3 }} />
                        <Area type="monotone" dataKey="pages" stroke="#FBBD7E" fill="url(#colorPages)" strokeWidth={2} dot={false} />
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

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Events Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(perEvent || []).map((e) => {
                  const pct = totals.maxEventCount > 0 ? Math.round(((e.count || 0) / totals.maxEventCount) * 100) : 0;
                  return (
                    <div key={String(e._id)} className="p-2 border rounded">
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
