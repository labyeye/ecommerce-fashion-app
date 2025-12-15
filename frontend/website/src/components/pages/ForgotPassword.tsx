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
      const API_BASE = (import.meta.env.VITE_API_URL as string) ||
        "http://localhost:3500/api";
      const url = `${API_BASE.replace(/\/+$/, "")}/api/auth/forgot-password`;

      // Normalize email to avoid mismatches (trim + lowercase)
      const normalizedEmail = (email || "").trim().toLowerCase();

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      // Privacy-friendly response: if email not found, don't leak existence
      if (!res.ok) {
        if (res.status === 404) {
          // Show generic message to avoid leaking whether the account exists
          setMessage(
            "If an account exists for that email, we've sent password reset instructions."
          );
          setTimeout(() => navigate("/login"), 1500);
          return;
        }

        const msg = data?.message || `Request failed with status ${res.status}`;
        throw new Error(msg);
      }

      setMessage("If an account exists for that email, we've sent password reset instructions.");
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
    <div className="h-[40vh] pt-24 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-3xl font-semibold mb-4">Forgot Password</h2>
          {message && (
            <div className="mb-4 text-sm text-red-700">{message}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xl sm:text-xl">Email</label>
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
                className="px-4 py-2 bg-[#95522C] text-background rounded"
                disabled={loading}
              >
                Send Reset Email
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-[#95522C] text-[#95522C] rounded"
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
