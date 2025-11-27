import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ChangePhone: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage("Not authenticated");
    if (!phone || !password) return setMessage("Fill all fields");
    setLoading(true);
    try {
      const res = await fetch(
        "https://ecommerce-fashion-app-som7.vercel.app/api/customer/change-phone",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessage("Phone updated");
      setTimeout(() => navigate("/settings"), 800);
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate("/settings");

  return (
    <div className="min-h-screen pt-20 pb-16 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 md:p-10 max-w-md sm:max-w-lg mx-auto mb-12">
          <span className="block text-2xl md:text-3xl font-semibold mb-4">Change Phone</span>
          {message && (
            <span className="block mb-4 text-sm md:text-base text-red-700">{message}</span>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm md:text-base mb-1">New Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded px-3 py-2 h-10 md:h-12 focus:outline-none focus:ring-2 focus:ring-[#c89a7a]"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base mb-1">
                Current Password (to confirm)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 h-10 md:h-12 focus:outline-none focus:ring-2 focus:ring-[#c89a7a]"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-[#95522C] text-white rounded disabled:opacity-60"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                className="w-full sm:w-auto px-4 py-2 border rounded bg-white"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePhone;
