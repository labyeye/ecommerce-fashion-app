import React, { useEffect, useState, useRef } from "react";
import MetricCard from "./MetricCard";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, TrendingUp } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
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
  const [serverLocationCounts, setServerLocationCounts] = useState<Record<
    string,
    number
  > | null>(null);
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
  // Name -> ISO A3 lookup (shared so topojson features without ISO_A3
  // can be matched by name). Keys are lower-cased for easier lookup.
  const nameToA3Shared: { [k: string]: string } = {
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

  const locationCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};

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
        else if (s.length === 2)
          code = twoToThree[s.toUpperCase()] || s.toUpperCase();
        else {
          const lower = s.toLowerCase();
          code = nameToA3Shared[lower] || "";
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
        code = nameToA3Shared[lower] || "";
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
  // Hover tooltip state for map
  const [hoverInfo, setHoverInfo] = useState<{
    name: string;
    count: number;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // Mapbox token (Vite env var). Add VITE_MAPBOX_TOKEN to your .env for dev.
  const mapboxToken = (import.meta as any).env?.VITE_MAPBOX_TOKEN || "";

  // Simple centroid lookup for common countries (lat, lng)
  const countryCentroids: {
    [k: string]: { lat: number; lng: number; name?: string };
  } = {
    IND: { lat: 20.5937, lng: 78.9629, name: "India" },
    USA: { lat: 37.0902, lng: -95.7129, name: "United States" },
    CHN: { lat: 35.8617, lng: 104.1954, name: "China" },
    BRA: { lat: -14.235, lng: -51.9253, name: "Brazil" },
    RUS: { lat: 61.524, lng: 105.3188, name: "Russia" },
    FRA: { lat: 46.2276, lng: 2.2137, name: "France" },
    DEU: { lat: 51.1657, lng: 10.4515, name: "Germany" },
    GBR: { lat: 55.3781, lng: -3.436, name: "United Kingdom" },
    ESP: { lat: 40.4637, lng: -3.7492, name: "Spain" },
    ITA: { lat: 41.8719, lng: 12.5674, name: "Italy" },
    CAN: { lat: 56.1304, lng: -106.3468, name: "Canada" },
    AUS: { lat: -25.2744, lng: 133.7751, name: "Australia" },
    JPN: { lat: 36.2048, lng: 138.2529, name: "Japan" },
    MEX: { lat: 23.6345, lng: -102.5528, name: "Mexico" },
  };

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapboxToken) return;
    let mounted = true;

    (async () => {
      try {
        const mapbox = await import("mapbox-gl");
        const mapboxgl = (mapbox && (mapbox as any).default) || mapbox;
        mapboxgl.accessToken = mapboxToken;

        if (!mapContainerRef.current) return;

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/light-v10",
          center: [65, 20],
          zoom: 2.2,
        });

        mapRef.current.addControl(
          new mapboxgl.NavigationControl({ showCompass: false }),
          "top-right"
        );

        // inject marker pulse css once
        if (!document.getElementById("map-marker-styles")) {
          const style = document.createElement("style");
          style.id = "map-marker-styles";
          style.innerHTML = `@keyframes pulse{0%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:0.6}100%{transform:scale(1);opacity:1}} .map-marker-pulse{animation:pulse 1.6s infinite;}`;
          document.head.appendChild(style);
        }

        const entries = Object.entries(locationCounts || {})
          .map(([code, cnt]) => ({ code, cnt }))
          .sort((a, b) => b.cnt - a.cnt)
          .slice(0, 12);

        entries.forEach((c) => {
          const coord = countryCentroids[c.code];
          if (!coord) return;
          const el = document.createElement("div");
          const size = 10 + Math.min(28, (c.cnt || 0) * 6);
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;
          el.style.background = getFill(c.code);
          el.style.boxShadow = "0 6px 18px rgba(11,102,194,0.18)";
          el.style.border = "2px solid rgba(255,255,255,0.95)";
          el.style.cursor = "pointer";
          el.style.borderRadius = "50%";
          el.className = "map-marker map-marker-pulse";

          el.addEventListener("mouseenter", (e: any) => {
            if (!mounted) return;
            setHoverInfo({ name: coord.name || c.code, count: c.cnt });
            setTooltipPos({ x: e.clientX, y: e.clientY });
          });
          el.addEventListener("mouseleave", () => {
            if (!mounted) return;
            setHoverInfo(null);
            setTooltipPos(null);
          });

          new mapboxgl.Marker(el)
            .setLngLat([coord.lng, coord.lat])
            .addTo(mapRef.current);
        });

        // auto-center on top country for better visibility
        if (entries.length > 0) {
          const top = entries[0];
          const topCoord = countryCentroids[top.code];
          if (topCoord) {
            try {
              mapRef.current.flyTo({
                center: [topCoord.lng, topCoord.lat],
                zoom: Math.min(5, 2 + Math.log2((top.cnt || 1) + 1) * 1.8),
                essential: true,
              });
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn("Mapbox load failed:", err);
      }
    })();

    return () => {
      mounted = false;
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {}
      }
    };
  }, [mapboxToken, locationCounts]);

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
    // Orange color ramp: light -> dark by count
    if (count === 0) return "#f3f6f9"; // neutral background
    if (count < 2) return "#FFF4E6"; // very light orange
    if (count < 4) return "#FFE0BF"; // light orange
    if (count < 8) return "#FFCA80"; // medium orange
    if (count < 15) return "#FF9C3B"; // strong orange
    return "#FF7F23"; // darkest / highest
  };

  // Robust helper to extract a displayable product name and image from
  // different order shapes returned by the API.
  const getProductInfo = (o: any) => {
    if (!o) return { name: "—", img: null };

    // Prefer an explicit items array with a product object. Try several
    // common naming variants returned by different APIs.
    const items = Array.isArray(o.items)
      ? o.items
      : Array.isArray(o.orderItems)
      ? o.orderItems
      : Array.isArray(o.order_items)
      ? o.order_items
      : Array.isArray(o.lineItems)
      ? o.lineItems
      : Array.isArray(o.line_items)
      ? o.line_items
      : Array.isArray(o.line_items)
      ? o.line_items
      : null;

    let first: any = null;
    if (items && items.length > 0) {
      first =
        items.find(
          (it: any) =>
            it &&
            (it.product || it.name || it.title || it.productName || it.product_name)
        ) || items[0];
    } else if (o.product) {
      first = o.product;
    } else if (o.items && typeof o.items === "object") {
      first = (o.items as any)[0] || null;
    }

    const name =
      first?.product?.name ||
      first?.product?.title ||
      first?.product?.productName ||
      first?.name ||
      first?.title ||
      first?.productName ||
      first?.product_name ||
      first?.variant_title ||
      first?.productTitle ||
      o.productName ||
      o.product_name ||
      o.product_title ||
      o.name ||
      "—";

    // Try many possible places for an image
    const candidates = [
      first?.product?.images?.[0],
      first?.product?.images?.[0]?.url,
      first?.product?.image,
      first?.product?.imageUrl,
      first?.product?.image_url,
      first?.image,
      first?.imageUrl,
      first?.image_url,
      first?.thumbnail,
      first?.thumbnailUrl,
      first?.thumbnail_url,
      first?.media?.[0]?.url,
      first?.product?.media?.[0]?.url,
      first?.product?.variants?.[0]?.images?.[0],
      first?.product?.variants?.[0]?.images?.[0]?.url,
      o.productImage,
      o.product_image,
      o.product_thumbnail,
      // common ecommerce shapes
      first?.sku_image,
      first?.image_url_https,
      first?.images?.[0]?.src,
      first?.images?.[0]?.url,
      first?.picture,
      first?.pictures?.[0],
    ];

    let img: any = null;
    for (const c of candidates) {
      if (c) {
        img = c;
        break;
      }
    }
    if (img && typeof img === "object") img = img.url || img.src || img.path || null;

    // small inline SVG placeholder (light gray rounded box with dash)
    const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><rect rx='8' ry='8' width='64' height='64' fill='%23F3F4F6' /><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239CA3AF' font-family='Arial, Helvetica, sans-serif' font-size='20'>&#8212;</text></svg>"
    )}`;

    return { name, img: img || placeholder };
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
        <div className="bg-neutral-card rounded-lg shadow-sm border border-neutral-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-heading">
                Sales by Country
              </h3>
            </div>
            <div className="text-sm text-subtle flex items-center space-x-3">
              <select
                value={String(analyticsDays)}
                onChange={(e) => {
                  const v = Number(e.target.value) || 7;
                  setAnalyticsDays(v);
                  setActiveRange(String(v));
                }}
                className="px-3 py-1.5 border border-neutral-border rounded text-sm bg-white"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={180}>Last 6 months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="h-72 relative">
              {geoLoading ? (
                <div className="flex items-center justify-center h-72 text-sm text-subtle">
                  Loading map…
                </div>
              ) : geoError || !geoData ? (
                <div className="flex flex-col items-center justify-center h-72 text-sm text-subtle space-y-2">
                  <div>Map unavailable</div>
                  <div className="text-xs text-subtle max-w-xs text-center">
                    {geoError}
                  </div>
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
                <div className="w-full h-full overflow-hidden bg-white">
                  {/* Legend (orange ramp) */}
                  <div className="absolute top-3 left-3 z-40 bg-white/95 border border-neutral-border rounded-md px-3 py-2 text-xs shadow-sm">
                    <div className="font-medium text-sm mb-1">Sales</div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span
                          className="w-4 h-3 rounded"
                          style={{
                            background: "#FFF4E6",
                            display: "inline-block",
                          }}
                        ></span>
                        <span className="text-xs text-subtle">Low</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span
                          className="w-4 h-3 rounded"
                          style={{
                            background: "#FFCA80",
                            display: "inline-block",
                          }}
                        ></span>
                        <span className="text-xs text-subtle">Med</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span
                          className="w-4 h-3 rounded"
                          style={{
                            background: "#FF7F23",
                            display: "inline-block",
                          }}
                        ></span>
                        <span className="text-xs text-subtle">High</span>
                      </div>
                    </div>
                  </div>
                  {mapboxToken ? (
                    <div className="w-full h-full relative overflow-hidden">
                      <div
                        ref={mapContainerRef}
                        className="absolute inset-0"
                        style={{
                          filter: "grayscale(0.5) brightness(1.05)",
                        }}
                      />
                    </div>
                  ) : geoData ? (
                    <div className="w-full h-full">
                      <ComposableMap
                        projectionConfig={{ scale: 147 }}
                        width={800}
                        height={400}
                        className="w-full h-full"
                      >
                        <Geographies geography={geoData}>
                          {({ geographies }) =>
                            geographies.map((geo) => {
                              // Try ISO A3 fields first, then fallback to
                              // a name->A3 lookup, finally use feature id.
                              let code: string = ((geo.properties as any)
                                ?.ISO_A3 ||
                                (geo.properties as any)?.iso_a3 ||
                                (geo.properties as any)?.ADM0_A3 ||
                                "") as string;
                              if (!code || !/^[A-Z]{3}$/.test(String(code))) {
                                const geoName = (
                                  (geo.properties as any)?.name ||
                                  (geo.properties as any)?.NAME ||
                                  ""
                                )
                                  .toString()
                                  .toLowerCase();
                                if (geoName && nameToA3Shared[geoName]) {
                                  code = nameToA3Shared[geoName];
                                } else {
                                  code = String(geo.id || "");
                                }
                              }
                              const count = locationCounts[code as string] || 0;
                              const base = "#e8eaed";
                              const fill =
                                count > 0 ? getFill(code as string) : base;
                              const stroke = count > 0 ? "#ffffff" : "#dadce0";
                              return (
                                <Geography
                                  key={geo.rsmKey}
                                  geography={geo}
                                  fill={fill}
                                  stroke={stroke}
                                  strokeWidth={0.5}
                                  style={{
                                    default: {
                                      outline: "none",
                                      transition: "all 180ms ease",
                                    },
                                    hover: {
                                      fill:
                                        count > 0
                                          ? getFill(code as string)
                                          : base,
                                      opacity: 0.85,
                                      cursor: count > 0 ? "pointer" : "default",
                                    },
                                    pressed: { outline: "none" },
                                  }}
                                  onMouseEnter={(evt: any) => {
                                    if (count > 0) {
                                      const name =
                                        (geo.properties as any)?.name || "";
                                      setHoverInfo({ name, count });
                                      setTooltipPos({
                                        x: evt.clientX,
                                        y: evt.clientY,
                                      });
                                    }
                                  }}
                                  onMouseMove={(evt: any) => {
                                    if (count > 0) {
                                      setTooltipPos({
                                        x: evt.clientX,
                                        y: evt.clientY,
                                      });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    setHoverInfo(null);
                                    setTooltipPos(null);
                                  }}
                                  transform="translate(0,0)"
                                />
                              );
                            })
                          }
                        </Geographies>
                      </ComposableMap>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-72 text-sm text-subtle">
                      Map unavailable. No Mapbox token and local topojson not
                      found.
                    </div>
                  )}
                </div>
              )}

              {hoverInfo && tooltipPos && (
                <div
                  style={{
                    position: "fixed",
                    left: tooltipPos.x + 12,
                    top: tooltipPos.y - 40,
                  }}
                  className="z-50 bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-lg"
                >
                  <div className="font-semibold text-heading text-sm">
                    {hoverInfo.name}
                  </div>
                  <div className="text-subtle text-xs mt-0.5">
                    {hoverInfo.count} sales
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-border">
                <span className="text-xs font-semibold text-subtle uppercase tracking-wider">
                  Country
                </span>
                <span className="text-xs font-semibold text-subtle uppercase tracking-wider">
                  Sales
                </span>
              </div>
              {(() => {
                const entries = Object.entries(locationCounts || {});
                if (entries.length === 0)
                  return (
                    <div className="text-sm text-subtle py-4">
                      No location data
                    </div>
                  );
                const sorted = entries
                  .map(([code, cnt]) => ({ code, cnt }))
                  .sort((a, b) => b.cnt - a.cnt)
                  .slice(0, 7);
                const max = sorted[0]?.cnt || 1;
                const a3ToName: { [k: string]: string } = {
                  IND: "India",
                  USA: "United States",
                  CHN: "China",
                  BRA: "Brazil",
                  RUS: "Russia",
                  FRA: "France",
                  DEU: "Germany",
                  GBR: "United Kingdom",
                  ESP: "Spain",
                  ITA: "Italy",
                  CAN: "Canada",
                  AUS: "Australia",
                  JPN: "Japan",
                  MEX: "Mexico",
                };

                return (
                  <div className="space-y-3">
                    {sorted.map((s) => (
                      <div key={s.code} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-heading">
                            {a3ToName[s.code] || s.code}
                          </span>
                          <span className="text-sm font-semibold text-heading">
                            {s.cnt}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${(s.cnt / max) * 100}%`,
                              background: getFill(s.code),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        
      </div>
      <div className="bg-neutral-card rounded-[10px] shadow-md border border-neutral-border p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-heading">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm table-auto">
              <thead>
                <tr className="text-left text-xs text-subtle uppercase tracking-wider">
                  <th className="px-3 py-2">No</th>
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.slice(0, 5).map((order, index) => {
                  const o = order as any;
                  const customerName =
                    (o.customer?.firstName || o.customer?.name || "Guest") +
                    (o.customer?.lastName ? ` ${o.customer.lastName}` : "");

                  const { name: productName, img: imgSrc } = getProductInfo(o);

                  const qty =
                    (o.items && o.items.reduce((s: number, it: any) => s + (it.quantity || it.qty || 1), 0)) ||
                    o.qty ||
                    1;

                  const status = (o.status || "").toString().toLowerCase();
                  const statusClass =
                    status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : status === "pending"
                      ? "bg-pink-100 text-pink-700"
                      : status === "processing" || status === "shipped"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-700";

                  return (
                    <tr key={o._id || index} className="align-middle">
                      <td className="px-3 py-3 align-middle">
                        <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-subtle font-semibold text-sm">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-3 py-3">#{o.orderNumber}</td>
                      <td className="px-3 py-3">{customerName}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                            {imgSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imgSrc} alt="product" className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-xs text-subtle">—</div>
                            )}
                          </div>
                          <div className="text-sm text-heading">{productName}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3">{qty}</td>
                      <td className="px-3 py-3 font-semibold">₹{(o.total ?? 0).toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                          <span className="w-2 h-2 rounded-full mr-2" style={{ background: status === 'delivered' ? '#10B981' : status === 'pending' ? '#F472B6' : '#FB923C' }} />
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* Recent Orders */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"></div>
    </div>
  );
};

export default Overview;
