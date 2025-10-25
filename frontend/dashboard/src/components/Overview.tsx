import React, { useEffect, useState } from "react";
import MetricCard from "./MetricCard";
import { useAuth } from "../context/AuthContext";
import { AlertTriangle, TrendingUp, Package } from "lucide-react";

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

interface LowStockProduct {
  _id: string;
  name: string;
  stock: {
    quantity: number;
    trackStock: boolean;
  };
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
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>(
    []
  );
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setLowStockProducts(data.data.lowStockProducts);
        setRecentOrders(data.data.recentOrders);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const getStatusCount = (status: string) => {
    const statusCount = orderStatusCounts.find((s) => s._id === status);
    return statusCount ? statusCount.count : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ds-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-ds-100 border border-ds-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-ds-300" />
            <h2 className="font-semibold text-ds-900">
              Error Loading Dashboard
            </h2>
          </div>
          <p className="text-ds-700">{error}</p>
        </div>
      </div>
    );
  }

  // metrics array removed; we'll render top metric cards directly in JSX below

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ds-900">Dashboard Overview</h1>
          <p className="text-ds-700 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="text-sm text-ds-700">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toFixed(2) ?? '0.00'}`} icon="DollarSign" />
          <MetricCard title="Total Orders" value={`${stats?.totalOrders ?? 0}`} icon="ShoppingBag" />
          {/* Explicit status cards requested by the user */}
          {(() => {
            const statuses = [
              { keys: ['confirmed'], label: 'Confirmed Orders', icon: 'Users' },
              { keys: ['processed', 'processing'], label: 'Processed Orders', icon: 'TrendingUp' },
              { keys: ['shipping', 'shipped', 'in_transit'], label: 'Shipping Orders', icon: 'ShoppingBag' },
              { keys: ['delivered'], label: 'Delivered Orders', icon: 'Target' },
              { keys: ['cancelled', 'canceled'], label: 'Cancelled Orders', icon: 'BarChart3' },
            ];

            return statuses.map((st) => {
              const count = st.keys.reduce((sum, k) => sum + getStatusCount(k), 0);
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
        </div>

      {/* Recent Orders */}
      <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-ds-600" />
          <h3 className="text-lg font-semibold text-ds-900">Recent Orders</h3>
        </div>
        <div className="space-y-3">
          {recentOrders.slice(0, 5).map((order, index) => (
            <div
              key={order._id}
              className="flex items-center justify-between p-3 bg-ds-100 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-ds-200 rounded-full flex items-center justify-center text-ds-700 font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-ds-900">
                    #{order.orderNumber}
                  </p>
                  <p className="text-sm text-ds-700">
                    {order.customer?.firstName ?? "Guest"}{" "}
                    {order.customer?.lastName ?? ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ds-900">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-ds-700" />
            <h3 className="text-lg font-semibold text-ds-900">
              Low Stock Alert
            </h3>
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 bg-ds-100 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-ds-900">{product.name}</p>
                    <p className="text-sm text-ds-700">
                      Only {product.stock.quantity} left
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <button className="px-3 py-1 bg-ds-200 text-ds-700 rounded text-sm hover:bg-ds-300">
                    Restock
                  </button>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-4 text-ds-700">
                <Package className="w-8 h-8 mx-auto mb-2 text-ds-500" />
                <p>All products are well stocked!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
