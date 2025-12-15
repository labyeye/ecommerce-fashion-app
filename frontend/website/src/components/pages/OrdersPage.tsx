import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import Invoice from "../Invoice";
import { ChevronRight } from "lucide-react";

const OrdersPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
    const [isMobile, setIsMobile] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<any>(null);

  useEffect(() => {
    if (!user || !token) return;
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const apiBase = import.meta.env.VITE_API_URL || "https://backend.flauntbynishi.com";
        const res = await fetch(`${apiBase}/api/customer/orders`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 401) {
            logout();
            navigate("/login");
            return;
          }
          throw new Error(data.message || "Failed to fetch orders");
        }
        setOrders(data.data.orders || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token]);

   useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleDownloadInvoice = async (ord: any) => {
    setSelectedOrderForInvoice(ord);
    setTimeout(async () => {
      try {
        if (!invoiceRef.current) return;
        const { downloadRefAsPDF } = await import("../../utils/invoice");
        await downloadRefAsPDF(invoiceRef.current, `invoice-${ord.orderNumber || ord._id}.pdf`);
      } catch (err) {
        console.error("Failed to download invoice", err);
        alert("Failed to download invoice");
      }
    }, 300);
  };

  const handlePrintInvoice = (ord: any) => {
    setSelectedOrderForInvoice(ord);
    setTimeout(async () => {
      try {
        if (!invoiceRef.current) return;
        const { printRef } = await import("../../utils/invoice");
        printRef(invoiceRef.current);
      } catch (err) {
        console.error("Failed to print invoice", err);
        alert("Failed to print invoice");
      }
    }, 300);
  };

  if (!user) return <LoadingMountainSunsetBeach text="Loading orders..." />;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background" >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
           {isMobile && (
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full border border-tertiary bg-background"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      )}
          <h1 className="text-2xl font-bold text-tertiary">My Orders</h1>
        </div>

        {/* Hidden invoice renderer */}
        <div style={{ position: "absolute", left: -9999, top: 0, width: 800 }} aria-hidden>
          {selectedOrderForInvoice && <Invoice order={selectedOrderForInvoice} ref={invoiceRef} />}
        </div>

        {loading ? (
          <LoadingMountainSunsetBeach text="Loading orders..." />
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-tertiary">No orders found.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="block font-semibold federo-numeric" style={{ color: "#95522C" }}>
                    {order.orderNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "delivered" ? "bg-green-100 text-green-800" : order.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                    {order.status}
                  </span>
                </div>

                <span className="block text-sm sm:text-sm text-tertiary federo-numeric mb-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="block text-sm sm:text-sm text-tertiary mb-2">{order.items.map((item: any) => item.product?.name).join(", ")}</span>
                <span className="block text-sm sm:text-sm text-tertiary federo-numeric">₹{order.total}</span>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/order/${order._id}`)} className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm">View Details</button>
                    <button onClick={() => handleDownloadInvoice(order)} className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm">Download Invoice</button>
                    <button onClick={() => handlePrintInvoice(order)} className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm">Print</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
