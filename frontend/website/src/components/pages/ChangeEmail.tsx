import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ChangeEmail: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage("Not authenticated");
    if (!newEmail || !password) return setMessage("Fill all fields");
    setLoading(true);
    try {
      const res = await fetch(
        "https://ecommerce-fashion-app-som7.vercel.app/api/customer/change-email",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newEmail, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessage("Email updated — please verify your new address");
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
    <div className="min-h-screen pt-24 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Change Email</h2>
          {message && (
            <div className="mb-4 text-sm text-red-700">{message}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm">
                Current Password (to confirm)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#95522C] text-white rounded"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                className="px-4 py-2 border rounded"
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

export default ChangeEmail;
