import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Phone } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logoblack.png";
// Google Sign-In Script Loader
const loadGoogleScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById("google-signin-script")) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = "google-signin-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Sign-In script"));
    document.body.appendChild(script);
  });
};

const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Phone OTP state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();
  const { setCredentials } = useAuth() as any;
  const navigate = useNavigate();

  // Google Sign-In
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    loadGoogleScript()
      .then(() => {
        setGoogleLoaded(true);
        initializeGoogleSignIn();
      })
      .catch((error) => {
        console.error("Failed to load Google Sign-In:", error);
      });
  }, []);

  const initializeGoogleSignIn = () => {
    if (typeof window === "undefined" || !window.google) return;

    window.google.accounts.id.initialize({
      client_id:
        "526636396003-t2i7mikheekskvb1j27su7alqlhj15vm.apps.googleusercontent.com",
      callback: handleGoogleCallback,
    });

    const googleButton = document.getElementById("google-signin-button");
    if (googleButton) {
      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
      });
    }
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      const res = await fetch("https://ecommerce-fashion-app-som7.vercel.app/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (setCredentials) {
          await setCredentials(data.token, data.user);
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        navigate("/");
      } else {
        alert(data.message || "Google sign-in failed");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Network error during Google sign-in");
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      // Error handled by auth context
    }
  };

  const sendOtpPhone = async () => {
    if (!phone)
      return alert(
        "Please enter your phone number in international format (e.g. +919876543210)"
      );
    setIsSending(true);
    try {
      const res = await fetch("https://ecommerce-fashion-app-som7.vercel.app/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
        alert(data.message || "OTP sent");
      } else {
        alert(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while sending OTP");
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtpPhone = async () => {
    if (!phone || !otp) return alert("Please enter phone and OTP");
    setIsVerifying(true);
    try {
      const res = await fetch("https://ecommerce-fashion-app-som7.vercel.app/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token && data.user) {
          if (setCredentials) {
            await setCredentials(data.token, data.user);
          } else {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          // If backend marked this account as newly created, send user to profile to complete details
          if (data.isNew) {
            navigate("/profile");
          } else {
            navigate("/");
          }
          return;
        }

        // Backwards compat: if backend returns tempToken (older flow), redirect to register
        if (data.userExists === false && data.tempToken) {
          const params = new URLSearchParams();
          params.set("tempToken", data.tempToken);
          params.set("phone", phone);
          navigate("/register?" + params.toString());
          return;
        }

        alert(
          data.message ||
            "OTP verification succeeded but returned unexpected payload"
        );
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while verifying OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className="login-page min-h-screen flex items-center justify-center px-4 py-8 sm:py-12"
      style={{ backgroundColor: "#FFF2E1" }}
    >
      <style>{`
        /* Enforce two-brand colors for login page */
        .login-page, .login-page * {
          color: #95522C !important;
          background-color: #FFF2E1 !important;
          border-color: #95522C !important;
          box-shadow: none !important;
        }

        .login-page a { color: #95522C !important; }

        .login-page .form-card {
          background-color: #FFF2E1 !important;
          border: 2px solid #95522C !important;
        }

        .login-page input, .login-page textarea, .login-page select {
          background-color: #FFF2E1 !important;
          color: #95522C !important;
          border: 1px solid #95522C !important;
        }

        .login-page button[type="submit"], .login-page .submit-btn {
          background-color: #95522C !important;
          color: #FFF2E1 !important;
          border-color: #95522C !important;
        }

        .login-page .toggle-btn {
          background-color: #FFF2E1 !important;
          color: #95522C !important;
          border: 1px solid #95522C !important;
        }

        .login-page .toggle-btn.active {
          background-color: #95522C !important;
          color: #FFF2E1 !important;
        }
      `}</style>

      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <img
            src={logo}
            alt="Flaunt by Nishi Logo"
            className="mx-auto w-48 h-48"
          />
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors duration-300 mb-4 sm:mb-6 text-2xl sm:text-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <p className="text-gray-600 text-2xl sm:text-xl">
            Sign in to your Flaunt by Nishi account
          </p>
        </div>

        <div className="form-card rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setLoginMode("email")}
              className={`toggle-btn flex-1 py-2 rounded-lg font-semibold ${
                loginMode === "email" ? "active" : ""
              }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("otp")}
              className={`toggle-btn flex-1 py-2 rounded-lg font-semibold ${
                loginMode === "otp" ? "active" : ""
              }`}
            >
              Phone Login
            </button>
          </div>

          {loginMode === "email" && (
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xl font-bold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xl font-bold mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold">
                <Link to="/forgot-password" className="hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="submit-btn w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {loginMode === "otp" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-xl font-bold mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg"
                    placeholder="+919876543210"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={sendOtpPhone}
                  disabled={isSending}
                  className="submit-btn flex-1 py-3 rounded-lg font-semibold text-lg"
                >
                  {isSending ? "Sending..." : "Send OTP"}
                </button>
              </div>

              {sent && (
                <>
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-xl font-bold mb-2"
                    >
                      Enter OTP
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full pr-4 py-3 rounded-lg"
                      placeholder="6-digit code"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={verifyOtpPhone}
                    disabled={isVerifying}
                    className="submit-btn w-full py-3 rounded-lg font-semibold text-lg"
                  >
                    {isVerifying ? "Verifying..." : "Verify OTP and Sign In"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* OTP Login */}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-xl font-bold">
              <span className="px-2 bg-[#FFF2E1] text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <div id="google-signin-button"></div>
          </div>

          {!googleLoaded && (
            <p className="text-center text-sm text-gray-500">
              Loading Google Sign-In...
            </p>
          )}
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-gray-600 text-xl">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
