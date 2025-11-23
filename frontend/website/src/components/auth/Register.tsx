import React, { useState, useEffect } from "react";
// react-phone-input-2 for country flags
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "flag-icon-css/css/flag-icons.min.css";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Google Sign-In Script Loader (same approach as Login.tsx)
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

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
  });
  const [phoneLocal, setPhoneLocal] = useState("");
  const [phoneDigitsCount, setPhoneDigitsCount] = useState(0);
  const PHONE_MAX_DIGITS = 15;
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const { register } = useAuth();
  const { setCredentials } = useAuth() as any;
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Initialize Google Sign-In for register page as well
  useEffect(() => {
    loadGoogleScript()
      .then(() => {
        setGoogleLoaded(true);
        initializeGoogleSignIn();
      })
      .catch((err) => console.error("Failed to load Google Sign-In:", err));
  }, []);

  const initializeGoogleSignIn = () => {
    if (typeof window === "undefined" || !window.google) return;

    window.google.accounts.id.initialize({
      client_id:
        (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) ||
        "526636396003-t2i7mikheekskvb1j27su7alqlhj15vm.apps.googleusercontent.com",
      callback: handleGoogleCallback,
    });

    const googleButton = document.getElementById(
      "google-signin-button-register"
    );
    if (googleButton) {
      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        text: "signup_with",
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
        // On successful Google sign-in, redirect to home
        window.location.href = "/";
      } else {
        alert(data.message || "Google sign-in failed");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Network error during Google sign-in");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If the field is 'city' or 'state', allow only alphabetic characters while typing
    const newValue =
      name === "city" || name === "state"
        ? value.replace(/[^A-Za-z]/g, "")
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Live password/confirm validation
    if (name === "password" || name === "confirmPassword") {
      const pass = name === "password" ? newValue : formData.password;
      const conf =
        name === "confirmPassword" ? newValue : formData.confirmPassword;
      // update confirm password live error
      if (conf && pass !== conf) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
      // live password rules can be shown via UI (no need to set errors here)
    }
  };

  const handlePhoneChange = (value: string) => {
    // Count digits only and enforce max digits for UX (do not aggressively strip country code)
    const digits = (value || "").replace(/\D/g, "");
    setPhoneDigitsCount(digits.length);
    // If digits exceed limit, prevent updating further characters (trim right)
    if (digits.length > PHONE_MAX_DIGITS) {
      // keep only first PHONE_MAX_DIGITS digits and rebuild a trimmed value using last characters
      const trimmed = digits.slice(0, PHONE_MAX_DIGITS);
      // Try to preserve leading '+' if present
      const prefix = value.startsWith("+") ? "+" : "";
      setPhoneLocal(prefix + trimmed);
      setFormData((prev) => ({ ...prev, phone: prefix + trimmed }));
    } else {
      setPhoneLocal(value);
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  const passwordRules = (p: string) => {
    return {
      minLength: p.length >= 8,
      hasLetter: /[A-Za-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecial: /[^A-Za-z0-9]/.test(p),
    };
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const pass = formData.password;
      const rules = passwordRules(pass);
      if (
        !rules.minLength ||
        !rules.hasLetter ||
        !rules.hasNumber ||
        !rules.hasSpecial
      ) {
        const msgs: string[] = [];
        if (!rules.minLength) msgs.push("be at least 8 characters");
        if (!rules.hasLetter) msgs.push("include a letter");
        if (!rules.hasNumber) msgs.push("include a number");
        if (!rules.hasSpecial) msgs.push("include a special character");
        newErrors.password = "Password must " + msgs.join(", ");
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, "");
      if (digits.length > PHONE_MAX_DIGITS) {
        newErrors.phone = `Phone number must be at most ${PHONE_MAX_DIGITS} digits`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    // Normalize phoneLocal into E.164-like (+country + number)
    let normalizedPhone = formData.phone || "";
    if (phoneLocal && phoneLocal.length) {
      const cleaned = phoneLocal
        .trim()
        .replace(/\s+/g, "")
        .replace(/[^0-9+]/g, "");
      if (cleaned.startsWith("+")) {
        normalizedPhone = cleaned;
      } else {
        const digitsOnly = cleaned.replace(/\D/g, "");
        // If digits start with country code already, prepend +
        // Otherwise, assume phoneLocal includes country dial without + and add +
        normalizedPhone = digitsOnly.startsWith("0")
          ? "+" + digitsOnly.replace(/^0+/, "")
          : "+" + digitsOnly;
      }
    }

    const userData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: normalizedPhone || undefined,
      address: {
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        country: formData.country,
      },
    };

    try {
      setIsLoading(true);
      await register(userData);
      // If we reach here, registration was successful
      setRegistrationSuccess(true);
      setUserEmail(formData.email);
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="register-page min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#FFF2E1" }}
    >
      <style>{`
        .register-page, .register-page * {
          color: #95522C !important;
          background-color: #FFF2E1 !important;
          border-color: #95522C !important;
          box-shadow: none !important;
        }
        .register-page .form-card { background-color: #FFF2E1 !important; border: 2px solid #95522C !important; }
        .register-page input, .register-page textarea, .register-page select { background-color: #FFF2E1 !important; color: #95522C !important; border: 1px solid #95522C !important; }
        .register-page button[type="submit"], .register-page .primary-btn { background-color: #95522C !important; color: #FFF2E1 !important; border-color: #95522C !important; }
        .register-page svg, .register-page svg * { }
      `}</style>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center mt-20">
          {!registrationSuccess ? (
            <>
              <span className="font-bold text-black mb-2 block text-5xl sm:text-xl md:text-2xl lg:text-5xl">
                Create Account
              </span>
              <span className="text-gray-600 block text-lg sm:text-base md:text-lg">
                Join Flauntbynishi for exclusive fashion
              </span>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <span className="font-bold text-black mb-2 block text-lg sm:text-xl md:text-2xl lg:text-3xl">
                Check Your Email
              </span>
              <span className="text-gray-600 block text-sm sm:text-base md:text-lg">
                We've sent a verification link to {userEmail}
              </span>
            </>
          )}
        </div>

        {!registrationSuccess ? (
          <div className="form-card rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-md font-medium  text-black mb-2"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 ml-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`block w-full pl-10 placeholder-tertiary pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400 ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && (
                    <span className="block mt-1 text-sm sm:text-md text-red-600">
                      {errors.firstName}
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-md font-medium  text-black mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full px-3 placeholder-tertiary py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400 ${
                      errors.lastName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <span className="block mt-1 text-sm sm:text-md text-red-600">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-md font-medium  text-black mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 ml-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 placeholder-tertiary pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <span className="block mt-1 text-sm sm:text-md text-red-600">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-md font-medium  text-black mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 ml-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <PhoneInput
                    country={"in"}
                    value={phoneLocal}
                    onChange={(value: string) => handlePhoneChange(value)}
                    inputClass={`block w-full pl-10 placeholder-tertiary py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    inputProps={{ name: "phone", id: "phone", maxLength: 20 }}
                  />
                  <div className="mt-1 text-sm text-tertiary/80">
                    {phoneDigitsCount}/{PHONE_MAX_DIGITS} digits
                  </div>
                </div>
                {errors.phone && (
                  <span className="block mt-1 text-sm sm:text-md text-red-600">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-md font-medium  text-black mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 ml-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-12 placeholder-tertiary py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400 ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute bottom-3.5 right-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-black" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="block mt-1 text-sm sm:text-md text-red-600">
                      {errors.password}
                    </span>
                  )}
                  {/* Live password rule hints */}
                  <div className="mt-2 text-sm space-y-1">
                    {(() => {
                      const rules = passwordRules(formData.password);
                      return (
                        <ul className="list-none m-0 p-0 space-y-1">
                          <li className="flex items-center text-sm">
                            {rules.minLength ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                              <span className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300" />
                            )}
                            <span
                              className={
                                rules.minLength
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }
                            >
                              Minimum 8 characters
                            </span>
                          </li>

                          <li className="flex items-center text-sm">
                            {rules.hasLetter ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                              <span className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300" />
                            )}
                            <span
                              className={
                                rules.hasLetter
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }
                            >
                              At least one letter
                            </span>
                          </li>

                          <li className="flex items-center text-sm">
                            {rules.hasNumber ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                              <span className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300" />
                            )}
                            <span
                              className={
                                rules.hasNumber
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }
                            >
                              At least one number
                            </span>
                          </li>

                          <li className="flex items-center text-sm">
                            {rules.hasSpecial ? (
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                              <span className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-300" />
                            )}
                            <span
                              className={
                                rules.hasSpecial
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }
                            >
                              At least one special character (e.g. @, #, !)
                            </span>
                          </li>
                        </ul>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-md font-medium  text-black mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute top-3.5 ml-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full pl-10 placeholder-tertiary pr-12 placeholder-tertiary py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400 ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute bottom-4 right-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-black" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="block mt-1 text-sm sm:text-md text-red-600">
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              {/* Address Fields (Optional) */}
              {/* <div className="space-y-4">
                <h6 className="text-md font-medium text-black">
                  Shipping Address (Optional)
                </h6>

                <div>
                  <input
                    name="street"
                    type="text"
                    autoComplete="street-address"
                    value={formData.street}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400"
                    placeholder="Street Address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <input
                    name="city"
                    type="text"
                    pattern="[A-Za-z]+"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400"
                    placeholder="City"
                  />
                  <input
                    name="state"
                    type="text"
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleChange}
                    className="block  w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400"
                    placeholder="State"
                  />
                  <input
                    name="zipCode"
                    type="text"
                    maxLength={6}
                    autoComplete="postal-code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="block w-full poppins-numeric px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-400"
                    placeholder="ZIP Code"
                  />
                </div>
              </div> */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border rounded-lg text-md font-medium primary-btn transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/30"></div>
                </div>
                <div className="relative flex justify-center text-md">
                  <span className="px-2 bg-white text-gray-400">Or</span>
                </div>
              </div>
            </div>

            {/* Google Sign-In */}
            <div className="flex justify-center mt-4">
              <div id="google-signin-button-register"></div>
            </div>

            {!googleLoaded && (
              <span className="block text-center text-sm sm:text-base text-gray-500">
                Loading Google Sign-In...
              </span>
            )}

            {/* Login Link */}
            <div className="mt-6 text-center">
              <span className="block text-lg sm:text-base text-black">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-gray-400 hover:text-black transition-colors duration-300"
                >
                  Sign in here
                </Link>
              </span>
            </div>
          </div>
        ) : (
          /* Success Message */
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-300/20 text-center">
            <div className="space-y-4">
              <span className="block text-sm sm:text-base text-gray-600">
                Please check your email and click the verification link to
                activate your account.
              </span>
              <span className="block text-sm sm:text-base text-gray-400">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    // TODO: Add resend verification functionality
                    console.log("Resend verification email");
                  }}
                  className="text-black hover:text-gray-400 font-semibold transition-colors duration-300"
                >
                  resend verification email
                </button>
              </span>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full bg-black text-white py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors duration-300 font-semibold"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <span className="block text-md sm:text-md text-gray-400/70">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-black">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-black">
              Privacy Policy
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;
