import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      // Error is handled by the auth context
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

        .login-page button[type="submit"] {
          background-color: #95522C !important;
          color: #FFF2E1 !important;
          border-color: #95522C !important;
        }

        /* Icons */
        .login-page svg, .login-page svg * { fill: #FFF2E1 !important; stroke: #95522C !important; color: #95522C !important; }
      `}</style>

      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors duration-300 mb-4 sm:mb-6 text-xl sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h2 className="text-4xl sm:text-3xl font-bold text-black mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-xl sm:text-sm">
            Sign in to your Flauntbynishi account
          </p>
        </div>

        {/* Login Form */}
        <div className="form-card rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Error Message */}
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  border: "1px solid #95522C",
                  backgroundColor: "#FFF2E1",
                  color: "#95522C",
                }}
              >
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xl sm:text-lg font-medium text-black mb-1.5 sm:mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute top-3 ml-3 flex items-center pointer-events-none">
                  <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xl sm:text-lg font-medium text-black mb-1.5 sm:mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute top-3 ml-3 flex items-center pointer-events-none">
                  <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-black" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-xl text-gray-600 hover:text-black transition-colors duration-300"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-xl font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-lg text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-black hover:text-gray-600 transition-colors duration-300"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-lg text-gray-500">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-black">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-black">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
