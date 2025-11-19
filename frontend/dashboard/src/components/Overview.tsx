import React, { useEffect, useState } from "react";
import MetricCard from "./MetricCard";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
// Removed accidental opening markdown fence
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrderCount: number;
}

interface OrderStatusCount {
  _id: string;
  count: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const Overview: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orderStatusCounts, setOrderStatusCounts] = useState<
    OrderStatusCount[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [serverLocationCounts, setServerLocationCounts] = useState<
    Record<string, number> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyticsData, setAnalyticsData] = useState<
    | {
        date: string;
        revenue: number;
        orders: number;
      }[]
    | null
  >(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState<number>(8);
  const [activeRange, setActiveRange] = useState<string>(String(analyticsDays));
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://ecommerce-fashion-app-som7.vercel.app/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch dashboard data"
          );
        }

        const data = await response.json();

        setStats(data.data.stats);
        setOrderStatusCounts(data.data.orderStatusCounts);
        setRecentOrders(data.data.recentOrders);
        setServerLocationCounts(data.data.locationCounts || null);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      setAnalyticsLoading(true);
      try {
        const res = await fetch(
          `https://ecommerce-fashion-app-som7.vercel.app/api/admin/analytics?days=${analyticsDays}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const d = await res.json().catch(() => null);
          if (d && d.success) {
            // Prefer pre-computed series if backend provides it
            if (Array.isArray(d.data?.series)) {
              const parsed = d.data.series.map((s: any) => ({
                date: s.date || s.label || String(s.x) || "",
                revenue: Number(s.revenue ?? s.value ?? s.y ?? 0),
                orders: Number(s.orders ?? s.count ?? 0),
              }));
              setAnalyticsData(parsed);
            } else if (Array.isArray(d.data?.monthlyRevenue)) {
              // Format monthlyRevenue -> chart format
              const parsed = d.data.monthlyRevenue.map((m: any) => ({
                date: m.month || m.label || String(m.x) || "",
                revenue: Number(m.revenue ?? 0),
                orders: Number(m.orders ?? 0),
              }));
              setAnalyticsData(parsed);
            } else {
              setAnalyticsData([]);
            }
          } else {
            setAnalyticsData([]);
          }
        } else {
          setAnalyticsData([]);
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setAnalyticsData(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, analyticsDays]);

  const getStatusCount = (status: string) => {
    const statusCount = orderStatusCounts.find((s) => s._id === status);
    return statusCount ? statusCount.count : 0;
  };

  // Simple sample location counts (ISO_A3 codes) used as fallback
  const sampleLocationCounts: Record<string, number> = {
    IND: 8,
    USA: 5,
    CHN: 4,
    BRA: 3,
    RUS: 2,
  };

  // Build a simple locationCounts map. If there is no country data in
  // recentOrders, fall back to `sampleLocationCounts` so the map shows
  // some highlighted countries like in the screenshot.
  const locationCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};

    // Small lookup table for common country names -> ISO A3 codes.
    const nameToA3: { [k: string]: string } = {
      india: "IND",
      "united states": "USA",
      "united states of america": "USA",
      china: "CHN",
      brazil: "BRA",
      russia: "RUS",
      france: "FRA",
      germany: "DEU",
      uk: "GBR",
      "united kingdom": "GBR",
      spain: "ESP",
      italy: "ITA",
      canada: "CAN",
      australia: "AUS",
      japan: "JPN",
      mexico: "MEX",
      indonesia: "IDN",
      pakistan: "PAK",
      nigeria: "NGA",
      bangladesh: "BGD",
      egypt: "EGY",
    };

    // If server provided aggregated location counts, normalize those keys
    if (serverLocationCounts && Object.keys(serverLocationCounts).length > 0) {
      const twoToThree: { [k: string]: string } = {
        IN: "IND",
        US: "USA",
        CN: "CHN",
        BR: "BRA",
        RU: "RUS",
        FR: "FRA",
        DE: "DEU",
        GB: "GBR",
        ES: "ESP",
        IT: "ITA",
        CA: "CAN",
        AU: "AUS",
        JP: "JPN",
        MX: "MEX",
      };

      Object.entries(serverLocationCounts).forEach(([raw, cnt]) => {
        if (!raw) return;
        const s = String(raw).trim();
        let code = "";
        if (s.length === 3) code = s.toUpperCase();
        else if (s.length === 2) code = twoToThree[s.toUpperCase()] || s.toUpperCase();
        else {
          const lower = s.toLowerCase();
          code = nameToA3[lower] || "";
        }
        if (code) counts[code] = (counts[code] || 0) + Number(cnt || 0);
      });

      if (Object.keys(counts).length === 0) return sampleLocationCounts;
      return counts;
    }

    // Fallback: derive from recentOrders (older behavior)
    recentOrders.forEach((o: any) => {
      // Prefer shippingAddress.country but accept other places if present
      const raw =
        o?.shippingAddress?.country ||
        o?.shippingAddress?.countryCode ||
        o?.customer?.country ||
        o?.customer?.countryCode ||
        "";
      if (!raw || typeof raw !== "string") return;
      const s = raw.trim();
      let code = "";

      if (s.length === 3) {
        // assume already ISO A3
        code = s.toUpperCase();
      } else if (s.length === 2) {
        // common 2-letter codes -> try map
        const two = s.toUpperCase();
        const twoToThree: { [k: string]: string } = {
          IN: "IND",
          US: "USA",
          CN: "CHN",
          BR: "BRA",
          RU: "RUS",
          FR: "FRA",
          DE: "DEU",
          GB: "GBR",
          ES: "ESP",
          IT: "ITA",
          CA: "CAN",
          AU: "AUS",
          JP: "JPN",
          MX: "MEX",
        };
        code = twoToThree[two] || two;
      } else {
        const lower = s.toLowerCase();
        code = nameToA3[lower] || "";
      }

      if (code) {
        counts[code] = (counts[code] || 0) + 1;
      }
    });

    if (Object.keys(counts).length === 0) return sampleLocationCounts;
    return counts;
  }, [recentOrders, serverLocationCounts]);

  // Topology: prefer a local file placed at `public/assets/world-110m.json`.
  // Many CDNs block cross-origin requests in some environments; to avoid
  // intermittent 404/CORS issues we require the local asset. Download it
  // from https://unpkg.com/world-atlas@2.0.2/world/110m.json and place it in
  // `frontend/dashboard/public/assets/world-110m.json` (or adjust the path).
  const [geoData, setGeoData] = useState<any | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState<string | null>(null);

  const loadLocalGeo = async () => {
    setGeoLoading(true);
    setGeoError(null);
    try {
      const res = await fetch("/assets/world-110m.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setGeoData(json);
    } catch (err: any) {
      console.warn("Failed to fetch local geography:", err.message || err);
      setGeoError(
        "Map data not found. Place `world-110m.json` at `public/assets/world-110m.json` (download from https://unpkg.com/world-atlas@2.0.2/world/110m.json)"
      );
      setGeoData(null);
    } finally {
      setGeoLoading(false);
    }
  };

  useEffect(() => {
    loadLocalGeo();
  }, []);

  const getFill = (code: string) => {
    const count = locationCounts[code] || 0;
    if (count === 0) return "#eaf2fb";
    if (count < 3) return "#a6d0f6";
    if (count < 6) return "#4ca3e8";
    return "#0b66c2";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-56">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-neutral-card border border-neutral-border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-subtle" />
            <h2 className="font-semibold text-heading">
              Error Loading Dashboard
            </h2>
          </div>
          <p className="text-subtle">{error}</p>
        </div>
      </div>
    );
  }

  // metrics array removed; we'll render top metric cards directly in JSX below

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">
            Dashboard Overview
          </h1>
          <p className="text-subtle mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="text-sm text-subtle">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toFixed(2) ?? "0.00"}`}
          icon="DollarSign"
        />
        <MetricCard
          title="Total Orders"
          value={`${stats?.totalOrders ?? 0}`}
          icon="ShoppingBag"
        />
        {/* Explicit status cards requested by the user */}
        {(() => {
          const statuses = [
            { keys: ["confirmed"], label: "Confirmed Orders", icon: "Users" },
            {
              keys: ["processed", "processing"],
              label: "Processed Orders",
              icon: "TrendingUp",
            },
            {
              keys: ["shipping", "shipped", "in_transit"],
              label: "Shipping Orders",
              icon: "ShoppingBag",
            },
            { keys: ["delivered"], label: "Delivered Orders", icon: "Target" },
            {
              keys: ["cancelled", "canceled"],
              label: "Cancelled Orders",
              icon: "BarChart3",
            },
          ];

          return statuses.map((st) => {
            const count = st.keys.reduce(
              (sum, k) => sum + getStatusCount(k),
              0
            );
            return (
              <MetricCard
                key={st.label}
                title={st.label}
                value={`${count}`}
                icon={st.icon}
              />
            );
          });
        })()}
        <MetricCard
          title="Total Users"
          value={`${stats?.totalUsers ?? 0}`}
          icon="Users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-heading">
                Revenue Analytics
              </h3>
              <div className="flex items-center text-sm text-subtle mt-2 space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-0.5 bg-primary-500 inline-block rounded"></span>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-0.5 bg-primary-200 inline-block rounded-[2px] border-b border-dashed"
                    style={{ borderStyle: "dashed" }}
                  ></span>
                  <span>Order</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setAnalyticsDays(7);
                  setActiveRange("7");
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeRange === "7"
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-card text-subtle border border-neutral-border"
                }`}
              >
                7d
              </button>
              <button
                onClick={() => {
                  setAnalyticsDays(30);
                  setActiveRange("30");
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeRange === "30"
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-card text-subtle border border-neutral-border"
                }`}
              >
                30d
              </button>
              <button
                onClick={() => {
                  setAnalyticsDays(180);
                  setActiveRange("180");
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeRange === "180"
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-card text-subtle border border-neutral-border"
                }`}
              >
                6m
              </button>
              <button
                onClick={() => {
                  setShowCustomRange(true);
                  setActiveRange("custom");
                  // initialize default custom dates to last 7 days
                  const today = new Date();
                  const prev = new Date();
                  prev.setDate(today.getDate() - 6);
                  setCustomStart(prev.toISOString().slice(0, 10));
                  setCustomEnd(today.toISOString().slice(0, 10));
                }}
                className={`px-3 py-1 rounded-lg text-sm ${
                  activeRange === "custom"
                    ? "bg-primary-500 text-white"
                    : "bg-neutral-card text-subtle border border-neutral-border"
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          <div style={{ width: "100%", height: 260 }} className="relative">
            {analyticsLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-md">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600"></div>
              </div>
            )}
            <ResponsiveContainer>
              <AreaChart data={analyticsData ?? []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF7F23" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#FF7F23" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#E6E6E6"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  stroke="#9CA3AF"
                />
                <YAxis axisLine={false} tickLine={false} stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value: number) => [
                    `₹${value.toLocaleString()}`,
                    "",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF7F23"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#FFD2B5"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {(!analyticsData ||
            (Array.isArray(analyticsData) && analyticsData.length === 0)) &&
            !analyticsLoading && (
              <p className="text-xs text-subtle mt-2">
                No analytics data available for the selected range.
              </p>
            )}
          {/* Custom range modal */}
          {showCustomRange && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
              <div className="bg-neutral-card border border-neutral-border rounded-lg p-4 w-96">
                <h4 className="text-heading font-semibold mb-2">
                  Custom Range
                </h4>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-subtle">Start date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-2 border border-neutral-border rounded-md"
                  />
                  <label className="text-sm text-subtle">End date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-2 border border-neutral-border rounded-md"
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setShowCustomRange(false)}
                      className="px-3 py-1 rounded-md bg-neutral-card border border-neutral-border text-subtle"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!customStart || !customEnd) return;
                        const s = new Date(customStart + "T00:00:00");
                        const e = new Date(customEnd + "T00:00:00");
                        const msPerDay = 24 * 60 * 60 * 1000;
                        const diff =
                          Math.round((e.getTime() - s.getTime()) / msPerDay) +
                          1;
                        if (isNaN(diff) || diff <= 0) {
                          // invalid range
                          setShowCustomRange(false);
                          return;
                        }
                        setAnalyticsDays(diff);
                        setActiveRange("custom");
                        setShowCustomRange(false);
                      }}
                      className="px-3 py-1 rounded-md bg-primary-500 text-white hover:bg-primary-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-heading">
              Most Sales Locations
            </h3>
          </div>
          <div className="h-44">
            {geoLoading ? (
              <div className="flex items-center justify-center h-44 text-sm text-subtle">Loading map…</div>
            ) : geoError || !geoData ? (
              <div className="flex flex-col items-center justify-center h-44 text-sm text-subtle space-y-2">
                <div>Map unavailable</div>
                <div className="text-xs text-subtle max-w-xs text-center">{geoError}</div>
                <div>
                  <button
                    onClick={loadLocalGeo}
                    className="mt-2 px-3 py-1 rounded bg-primary-500 text-white text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <ComposableMap
                projectionConfig={{ scale: 110 }}
                width={600}
                height={300}
                className="w-full h-full"
              >
                <Geographies geography={geoData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      // try a couple of properties for ISO A3 code
                      const code =
                        (geo.properties as any)?.ISO_A3 ||
                        (geo.properties as any)?.iso_a3 ||
                        geo.id;
                      const fill = getFill(code as string);
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#cbd5e1"
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", opacity: 0.9 },
                            pressed: { outline: "none" },
                          }}
                          aria-label={(geo.properties as any)?.name}
                        >
                          <title>{`${(geo.properties as any)?.name}: ${
                            locationCounts[
                              (geo.properties as any)?.ISO_A3 ||
                                (geo.properties as any)?.iso_a3 ||
                                geo.id
                            ] || 0
                          }`}</title>
                        </Geography>
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            )}
          </div>
        </div>
        <div className="bg-neutral-card rounded-[10px] shadow-md border border-neutral-border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-heading">
              Recent Orders
            </h3>
          </div>
          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((order, index) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-2 bg-neutral-card rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-subtle font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-heading">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-subtle">
                      {order.customer?.firstName ?? "Guest"}{" "}
                      {order.customer?.lastName ?? ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-heading">
                    ₹{(order.total ?? 0).toFixed(2)}
                  </p>
                  <p
                    className={`text-sm ${
                      order.status === "delivered"
                        ? "text-green-600"
                        : order.status === "pending"
                        ? "text-yellow-600"
                        : "text-blue-600"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
    </div>
  );
};

export default Overview;
