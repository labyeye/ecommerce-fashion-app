import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number;
    weekly: number;
    daily: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    cancelled: number;
    growth: number;
  };
  customers: {
    total: number;
    new: number;
    active: number;
    growth: number;
  };
  products: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  topProducts: Array<{
    _id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    totalOrders: number;
    totalSpent: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30");
  const [chartView, setChartView] = useState<
    "revenue" | "orders" | "customers"
  >("revenue");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://ecommerce-fashion-app-som7.vercel.app/api/admin/analytics?days=${timeRange}`,
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
            errorData.message || "Failed to fetch analytics data"
          );
        }

        const analyticsData = await response.json();
        setData(analyticsData.data);
      } catch (err: unknown) {
        console.error("Analytics fetch error:", err);
        setError(err instanceof Error ? err.message : String(err) || "Failed to fetch analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-900">
              Error Loading Analytics
            </h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h2 className="font-semibold text-yellow-900">No Analytics Data</h2>
          </div>
          <p className="text-yellow-700">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive insights into your business performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ds-700">Total Revenue</p>
              <p className="text-2xl font-bold text-ds-900">
                {formatCurrency(data.revenue.total)}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                data.revenue.growth >= 0 ? "bg-ds-200" : "bg-red-100"
              }`}
            >
              <DollarSign
                className={`w-6 h-6 ${
                  data.revenue.growth >= 0 ? "text-ds-700" : "text-red-600"
                }`}
              />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {data.revenue.growth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                data.revenue.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(data.revenue.growth)}% from last period
            </span>
          </div>
        </div>

        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ds-700">Total Orders</p>
              <p className="text-2xl font-bold text-ds-900">
                {formatNumber(data.orders.total)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-ds-200">
              <ShoppingCart className="w-6 h-6 text-ds-700" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {data.orders.growth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                data.orders.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(data.orders.growth)}% from last period
            </span>
          </div>
        </div>

        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ds-700">Total Customers</p>
              <p className="text-2xl font-bold text-ds-900">
                {formatNumber(data.customers.total)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-ds-200">
              <Users className="w-6 h-6 text-ds-700" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            {data.customers.growth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span
              className={`text-sm font-medium ${
                data.customers.growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {Math.abs(data.customers.growth)}% from last period
            </span>
          </div>
        </div>

        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ds-700">Total Products</p>
              <p className="text-2xl font-bold text-ds-900">
                {formatNumber(data.products.total)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-ds-200">
              <Package className="w-6 h-6 text-ds-700" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-ds-700">
              {data.products.lowStock} low stock, {data.products.outOfStock} out
              of stock
            </p>
          </div>
        </div>
      </div>

      {/* Revenue / Orders / Customers charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ds-900">Trends</h3>
            <div className="flex items-center space-x-3">
              <div
                className="inline-flex rounded-md shadow-sm"
                role="tablist"
                aria-label="Chart view"
              >
                <button
                  onClick={() => setChartView("revenue")}
                  className={`px-3 py-1 rounded ${
                    chartView === "revenue"
                      ? "bg-ds-200 text-ds-900"
                      : "bg-transparent text-ds-700"
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartView("orders")}
                  className={`px-3 py-1 rounded ${
                    chartView === "orders"
                      ? "bg-ds-200 text-ds-900"
                      : "bg-transparent text-ds-700"
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setChartView("customers")}
                  className={`px-3 py-1 rounded ${
                    chartView === "customers"
                      ? "bg-ds-200 text-ds-900"
                      : "bg-transparent text-ds-700"
                  }`}
                >
                  Customers
                </button>
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              {(() => {
                // build the appropriate chart element as a single child for ResponsiveContainer
                if (chartView === "revenue") {
                  return (
                    <AreaChart
                      data={data.monthlyRevenue}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#34D399"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#34D399"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: "#374151" }} />
                      <YAxis tickFormatter={(val) => `${val / 1000}k`} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  );
                }

                if (chartView === "orders") {
                  return (
                    <LineChart
                      data={data.monthlyRevenue}
                      margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                      <XAxis dataKey="month" tick={{ fill: "#374151" }} />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  );
                }

                // customers view: try to use customersSeries if provided, otherwise approximate distribution
                const customersSeries = (data as unknown as { customersSeries?: Array<{ month: string; count: number }> }).customersSeries;
                let series: Array<{ month: string; customers: number }> = [];

                if (customersSeries && Array.isArray(customersSeries)) {
                  series = customersSeries.map((c) => ({
                    month: c.month,
                    customers: c.count,
                  }));
                } else {
                  const totalNew = data.customers.new || 0;
                  const totalOrders =
                    data.monthlyRevenue.reduce(
                      (s, m) => s + (m.orders || 0),
                      0
                    ) || 1;
                  series = data.monthlyRevenue.map((m) => ({
                    month: m.month,
                    customers: Math.round(
                      ((m.orders || 0) / totalOrders) * totalNew
                    ),
                  }));
                }

                return (
                  <BarChart
                    data={series}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="month" tick={{ fill: "#374151" }} />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#8B5CF6" />
                  </BarChart>
                );
              })()}
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-ds-700 mt-3">
            Tip: change the time range above to view daily/monthly/yearly
            trends.
          </p>
        </div>

        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <h3 className="text-lg font-semibold text-ds-900 mb-4">
            Order Status Distribution
          </h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <RechartsPieChart>
                <Pie
                  data={data.orderStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.orderStatusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === "delivered"
                          ? "#10B981"
                          : entry.status === "pending"
                          ? "#F59E0B"
                          : entry.status === "cancelled"
                          ? "#EF4444"
                          : "#3B82F6"
                      }
                    />
                  ))}
                </Pie>
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products and Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Products
          </h3>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.sales} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Customers
          </h3>
          <div className="space-y-3">
            {data.topCustomers.map((customer, index) => (
              <div
                key={customer._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {customer.totalOrders} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-ds-100 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Monthly Revenue Trend
        </h3>
        <div className="space-y-4">
          {data.monthlyRevenue.map((month, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-500">{month.orders} orders</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(month.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-ds-100 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Order Status Distribution
        </h3>
        <div className="space-y-4">
          {data.orderStatusDistribution.map((status) => (
            <div
              key={status.status}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full ${
                    status.status === "delivered"
                      ? "bg-green-500"
                      : status.status === "pending"
                      ? "bg-yellow-500"
                      : status.status === "cancelled"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {status.status}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {status.count} orders
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {status.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
