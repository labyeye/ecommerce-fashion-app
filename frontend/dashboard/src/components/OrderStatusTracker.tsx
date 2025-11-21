import React from "react";
import { Check, ShoppingCart, CheckCircle, Box, Truck, MapPin, Package } from "lucide-react";

interface Props {
  status: string;
}

const steps = [
  { key: "placed", label: "Order Placed", icon: ShoppingCart },
  { key: "confirmed", label: "Payment Confirmed", icon: CheckCircle },
  { key: "packed", label: "Processing", icon: Box },
  { key: "picked", label: "Picked Up", icon: Truck },
  { key: "in_transit", label: "In-Transit", icon: MapPin },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Package },
  { key: "delivered", label: "Delivered", icon: Check },
];

const primary = "rgb(123 63 0)";

const statusToIndex = (status: string) => {
  const idx = steps.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

const OrderStatusTracker: React.FC<Props> = ({ status }) => {
  const current = statusToIndex(status || "");
  return (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const done = i <= current;
          const Icon = (s as any).icon;
          return (
            <div key={s.key} className="flex-1 text-center">
              <div style={{ width: 54 }} className="mx-auto">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 9999,
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: done ? primary : "#E9ECEF",
                  }}
                >
                  <Icon className={`w-5 h-5 ${done ? 'text-white' : 'text-[rgb(123 63 0)]'}`} />
                </div>
              </div>
              <div
                className={`mt-3 text-sm ${done ? "font-semibold" : "text-gray-500"}`}
                style={{ color: done ? primary : undefined }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
