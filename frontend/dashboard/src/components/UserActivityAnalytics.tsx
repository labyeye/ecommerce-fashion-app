import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `https://ecommerce-fashion-app-som7.vercel.app/api/admin/analytics/user-activity?days=${days}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        const data = json.data;
        setPerPage(data.perPage || []);
        setPerEvent(data.perEvent || []);
        // Convert timeSeries to chart-friendly form (sum across pages per day)
        const seriesMap: Record<string, number> = {};
        (data.timeSeries || []).forEach((it: any) => {
          const day = it._id.day;
          seriesMap[day] = (seriesMap[day] || 0) + it.count;
        });
        const seriesArr = Object.keys(seriesMap)
          .sort()
          .map((k) => ({ day: k, count: seriesMap[k] }));
        setTimeSeries(seriesArr);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, days]);

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
            {(perPage || []).slice(0, 4).map((p) => (
              <div key={String(p._id)} className="bg-white p-4 rounded shadow">
                <div className="text-sm text-gray-500">{p._id || 'Unknown'}</div>
                <div className="text-2xl font-bold">{p.count}</div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Activity Over Time</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={timeSeries}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Events Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(perEvent || []).map((e) => (
                <div key={String(e._id)} className="p-2 border rounded">
                  <div className="text-sm text-gray-600">{e._id}</div>
                  <div className="text-lg font-medium">{e.count}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserActivityAnalytics;
