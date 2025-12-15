import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!tokenParam) return setMessage("Reset token missing");
    if (!password || password.length < 6)
      return setMessage("Password must be at least 6 characters");
    if (password !== confirm) return setMessage("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch(
        "https://backend.flauntbynishi.com/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenParam, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setMessage("Password reset successful — redirecting to login");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (
    e
  ) => setPassword(e.target.value);
  const handleConfirmChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setConfirm(e.target.value);

  return (
    <div className="min-h-screen pt-24 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
          {message && (
            <div className="mb-4 text-sm text-red-700">{message}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="new-password" className="block text-sm">
                New Password
              </label>
              <input
                id="new-password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full border rounded px-3 py-2"
                type="password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                value={confirm}
                onChange={handleConfirmChange}
                className="w-full border rounded px-3 py-2"
                type="password"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#95522C] text-white rounded"
                disabled={loading}
              >
                Reset Password
              </button>
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={() => navigate("/login")}
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

export default ResetPassword;
