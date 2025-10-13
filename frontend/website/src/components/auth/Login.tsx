import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
// react-phone-input-2 for country flags
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import 'flag-icon-css/css/flag-icons.min.css'

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const { login, isLoading, error, clearError } = useAuth();
  // @ts-ignore - optional in context
  const { setCredentials } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (phoneMode) {
        // Phone mode: if OTP not sent yet, send it; otherwise verify
        if (!otpSent) {
          await sendOtp();
        } else {
          await verifyOtp();
        }
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (error) {
      // Error is handled by the auth context or individual functions
    }
  };

  const sendOtp = async () => {
    clearError();
    if (!phone || phone.length < 4) return;
    setOtpLoading(true);
    try {
      // normalize number into E.164 (single leading + and country code)
      let local = phone.trim();
      // remove spaces and common separators
      local = local.replace(/\s+/g, '');

      // if user pasted a number starting with +, keep digits after +
      const cleaned = local.replace(/[^0-9+]/g, '');
      const dial = countryCode.replace('+', '');
      let full = '';

      if (cleaned.startsWith('+')) {
        // already in +E.164 or similar
        full = cleaned;
      } else {
        const digitsOnly = cleaned.replace(/\D/g, '');
        // if digits already start with the dial code, avoid adding it again
        if (digitsOnly.startsWith(dial)) {
          full = '+' + digitsOnly;
        } else {
          // prepend selected country code
          full = countryCode + digitsOnly;
        }
      }

      const res = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: full })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        // show number in UI as full
        setPhone(full);
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    clearError();
    if (!otp || !phone) return;
    setOtpLoading(true);
    try {
      const res = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.userExists === false && data.tempToken) {
          // New phone: prompt registration form
          setTempToken(data.tempToken);
          setShowRegisterForm(true);
          setOtpSent(false);
        } else {
          // Existing user: set token
          if (setCredentials) {
            setCredentials(data.token, data.user);
          } else {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          navigate('/');
        }
      } else {
        alert(data.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setOtpLoading(false);
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
          {/* Toggle Email / Phone */}
          <div className="flex justify-center mb-4">
            <button type="button" onClick={() => setPhoneMode(false)} className={`px-4 py-2 rounded-l ${!phoneMode ? 'bg-[#95522C] text-[#FFF2E1]' : 'bg-[#FFF2E1] text-[#95522C]'}`}>Email</button>
            <button type="button" onClick={() => setPhoneMode(true)} className={`px-4 py-2 rounded-r ${phoneMode ? 'bg-[#95522C] text-[#FFF2E1]' : 'bg-[#FFF2E1] text-[#95522C]'}`}>Phone</button>
          </div>

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

            {/* Email or Phone Fields depending on mode */}
            {!phoneMode ? (
              <div>
                <label htmlFor="email" className="block text-xl sm:text-lg font-medium text-black mb-1.5 sm:mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute top-3 ml-3 flex items-center pointer-events-none">
                    <Mail className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400" placeholder="Enter your email" />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="phone" className="block text-xl sm:text-lg font-medium text-black mb-1.5 sm:mb-2">Phone Number</label>
                  <div className="relative">
                    {/* react-phone-input-2 provides a combined input with flag and country code */}
                    {/* @ts-ignore */}
                    <PhoneInput country={'in'} value={phone} onChange={(value: string, data: any) => {
                      setPhone(value); // value is like '919876543210' (no plus)
                      // data may be {} in some type definitions; guard access to dialCode
                      const dial = data && (data as any).dialCode ? (data as any).dialCode : countryCode.replace('+', '');
                      setCountryCode('+' + dial);
                    }} inputClass="w-full" containerClass="w-full" inputProps={{ name: 'phone', required: true }} />
                  </div>
                <div className="mt-3 flex items-center space-x-3">
                  <button type="button" onClick={sendOtp} disabled={otpLoading} className="px-4 py-2 bg-black text-white rounded">{otpLoading ? 'Sending...' : 'Send OTP'}</button>
                  {otpSent && <span className="text-sm text-gray-600">OTP sent to {phone}</span>}
                </div>
                {otpSent && (
                    <div className="mt-3">
                      <label htmlFor="otp" className="block text-sm font-medium text-black mb-1">Enter OTP</label>
                      <input id="otp" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="block w-full pl-3 pr-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400" placeholder="123456" />
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">Press "Sign In" to verify OTP and sign in.</p>
                      </div>
                    </div>
                )}
                {showRegisterForm && tempToken && (
                  <div className="mt-6 p-4 border border-gray-200 rounded">
                    <h3 className="text-lg font-semibold mb-3">Complete Registration</h3>
                    <div className="space-y-3">
                      <input placeholder="First name" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="w-full p-2 border rounded" />
                      <input placeholder="Last name" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="w-full p-2 border rounded" />
                      <input placeholder="Email (optional)" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full p-2 border rounded" />
                      <input placeholder="Choose a password" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full p-2 border rounded" />
                      <div className="flex space-x-2">
                        <button type="button" onClick={async () => {
                          if (!tempToken) return;
                          const res = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/auth/register-phone', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ tempToken, firstName: regFirstName, lastName: regLastName, password: regPassword, email: regEmail })
                          });
                          const d = await res.json();
                          if (res.ok) {
                            if (setCredentials) setCredentials(d.token, d.user);
                            navigate('/');
                          } else {
                            alert(d.message || 'Registration failed');
                          }
                        }} className="px-4 py-2 bg-black text-white rounded">Create account</button>
                        <button type="button" onClick={() => { setShowRegisterForm(false); setTempToken(null); }} className="px-4 py-2 border rounded">Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password Field (only for email mode) */}
            {!phoneMode && (
              <div>
                <label htmlFor="password" className="block text-xl sm:text-lg font-medium text-black mb-1.5 sm:mb-2">Password</label>
                <div className="relative">
                  <div className="absolute top-3 ml-3 flex items-center pointer-events-none">
                    <Lock className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400" placeholder="Enter your password" />
                  <button type="button" className="absolute bottom-3 right-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-black" />}</button>
                </div>
              </div>
            )}

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
