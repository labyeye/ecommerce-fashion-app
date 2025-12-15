import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Key, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [active, setActive] = useState<
    "none" | "password" | "email" | "phone" | "delete"
  >("none");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // change email form state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  // phone
  const [newPhone, setNewPhone] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage("Not authenticated");
    if (!currentPassword || !newPassword) return setMessage("Fill all fields");
    if (newPassword !== confirmPassword)
      return setMessage("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("https://backend.flauntbynishi.com/api/customer/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessage("Password changed successfully");
      setActive("none");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage("Not authenticated");
    if (!newEmail || !emailPassword) return setMessage("Fill all fields");
    setLoading(true);
    try {
      const res = await fetch("https://backend.flauntbynishi.com/api/customer/change-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newEmail, password: emailPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessage("Email updated — please verify your new address");
      setActive("none");
      setNewEmail("");
      setEmailPassword("");
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage("Not authenticated");
    if (!newPhone) return setMessage("Enter phone number");
    setLoading(true);
    try {
      const res = await fetch("https://backend.flauntbynishi.com/api/customer/change-phone", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: newPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMessage("Phone number updated");
      setActive("none");
      setNewPhone("");
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setMessage(text || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isMobile && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full border border-tertiary bg-background mb-4"
              aria-label="Go back"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <h4 className="font-semibold text-tertiary mb-4">
            Account Settings
          </h4>

          <div className="grid gap-3">
            <button
              onClick={() => navigate("/settings/change-password")}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <Key className="w-6 h-6 text-tertiary" />
                <div className="text-lg text-tertiary">Change Password</div>
              </div>
              <div className="text-gray-400">›</div>
            </button>

            <button
              onClick={() => navigate("/settings/change-email")}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-tertiary" />
                <div className="text-lg text-tertiary">Change Email</div>
              </div>
              <div className="text-gray-400">›</div>
            </button>

            <button
              onClick={() => navigate("/settings/change-phone")}
              className="flex items-center justify-between p-4 border rounded-md"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-tertiary" />
                <div className="text-lg text-tertiary">
                  Change Phone Number
                </div>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">
              {message}
            </div>
          )}

          {/* Forms */}
          {active === "password" && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-lg text-tertiary">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-lg text-tertiary">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-lg text-tertiary">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setActive("none")}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {active === "email" && (
            <form onSubmit={handleChangeEmail} className="mt-4 space-y-3">
              <div>
                <label className="block text-lg text-tertiary">
                  New Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-lg text-tertiary">
                  Current Password (to confirm)
                </label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
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
                  onClick={() => setActive("none")}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {active === "phone" && (
            <form onSubmit={handleChangePhone} className="mt-4 space-y-3">
              <div>
                <label className="block text-lg text-tertiary">
                  New Phone
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
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
                  onClick={() => setActive("none")}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
