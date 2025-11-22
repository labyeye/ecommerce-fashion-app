import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!email) return setMessage("Please enter your email");
    setLoading(true);
    try {
      const res = await fetch(
        "https://ecommerce-fashion-app-som7.vercel.app/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to send reset email");
      setMessage("Password reset email sent — check your inbox");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = () =>
    navigate("/login");

  return (
    <div className="min-h-screen pt-24 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
          {message && (
            <div className="mb-4 text-sm text-red-700">{message}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
                type="email"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#95522C] text-white rounded"
                disabled={loading}
              >
                Send Reset Email
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

export default ForgotPassword;
