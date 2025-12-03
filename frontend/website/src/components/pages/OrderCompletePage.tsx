import React, { useRef } from "react";
import { Check, Download } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Invoice from "../Invoice";
import { downloadRefAsPDF } from "../../utils/invoice";

const OrderCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = (location.state as any)?.orderData;
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-10 text-center bg-background">
          <div className="mx-auto w-28 h-28 rounded-full bg-[#95522C]/10 flex items-center justify-center mb-6">
            <Check className="w-12 h-12 text-[#95522C]" />
          </div>
          <h3 className="text-3xl font-bold text-tertiary mb-2">
            Payment Successful
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you! Your payment has been processed successfully.
          </p>

          {orderData?.order ? (
            <div className="inline-block text-left bg-white/60 p-4 rounded-lg border border-[#F0E6E0] mb-6">
              <div className="text-sm text-[#6C584F]">Order Number</div>
              <div className="font-semibold federo-numeric text-tertiary mb-1">
                {orderData.order.orderNumber || orderData.orderNumber}
              </div>
              <div className="text-sm text-[#6C584F]">Amount Paid</div>
              <div className="font-semibold federo-numeric text-tertiary">
                ₹{orderData.order.total || orderData.total}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="text-xl px-6 py-3 bg-[#95522C] text-white rounded-2xl font-semibold hover:brightness-95 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() =>
                navigate("/order/" + (orderData?.order?._id || ""))
              }
              className="text-xl px-6 py-3 border border-[#E6D7CF] text-[#2D2D2D] rounded-2xl hover:bg-[#FFF6F0] transition"
            >
              View Order Details
            </button>
          </div>
        </div>

        <div className="p-6 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate("/profile")}
              className="text-lg text-[#95522C] hover:underline"
            >
              Go to Profile
            </button>
            {orderData?.order && (
              <>
                <button
                  onClick={async () => {
                    try {
                      if (!invoiceRef.current) return;
                      await downloadRefAsPDF(
                        invoiceRef.current,
                        `invoice-${
                          orderData.order.orderNumber || orderData.order._id
                        }.pdf`
                      );
                    } catch (err) {
                      console.error("Download invoice error", err);
                      alert("Failed to download invoice");
                    }
                  }}
                  className="px-3 py-2 bg-[#F7F0EB] rounded-md flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4 text-[#95522C]" />
                  Download Invoice
                </button>
              </>
            )}
          </div>
        </div>
        {/* Off-screen invoice for PDF/print generation */}
        <div
          style={{ position: "absolute", left: -9999, top: 0, width: 800 }}
          aria-hidden
        >
          <Invoice order={orderData?.order || orderData} ref={invoiceRef} />
        </div>
      </div>
    </div>
  );
};

export default OrderCompletePage;
