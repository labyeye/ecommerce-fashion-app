import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import GlobalAuthLoader from "../ui/GlobalAuthLoader";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuth();
  const { setCredentials } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation() as any;

  // Google Sign-In
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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
        (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
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
      // Show loader immediately after Google OAuth success
      setIsAuthenticating(true);

      const res = await fetch(
        "https://ecommerce-fashion-app-som7.vercel.app/api/auth/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: response.credential }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        if (setCredentials) {
          await setCredentials(data.token, data.user);
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
        const from = (location && location.state && location.state.from) || "/";
        navigate(from);
      } else {
        setIsAuthenticating(false);
        alert(data.message || "Google sign-in failed");
      }
    } catch (error) {
      setIsAuthenticating(false);
      console.error("Google sign-in error:", error);
      alert("Network error during Google sign-in");
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      const ok = await login(email, password);
      if (ok) {
        const from = (location && location.state && location.state.from) || "/";
        navigate(from);
      }
    } catch (error) {}
  };

  return (
    <>
      <GlobalAuthLoader
        isVisible={isAuthenticating}
        message="Authenticating with Google..."
      />

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
            <span className="font-bold text-black mb-2 block text-5xl sm:text-xl md:text-2xl lg:text-5xl">
              Sign In
            </span>
            <span className="text-gray-600 block text-lg sm:text-base md:text-lg">
              Sign in with Flauntbynishi for exclusive fashion
            </span>
          </div>

          <div className="form-card rounded-xl sm:rounded-2xl p-6 sm:p-8">
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg placeholder-tertiary"
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
                    className="w-full pl-10 pr-12 py-3 rounded-lg placeholder-tertiary"
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
                className="submit-btn w-full py-3 rounded-lg placeholder-tertiary font-semibold text-lg transition-all duration-300"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xl font-bold">
                <span className="px-2 bg-[#FFF2E1]">Or continue with</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div id="google-signin-button"></div>
            </div>

            {!googleLoaded && (
              <span className="block text-center text-sm sm:text-base">
                Loading Google Sign-In...
              </span>
            )}
          </div>
          <div className="text-center">
            <span className="block text-gray-600 text-xl sm:text-xl">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold hover:underline">
                Sign Up
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
