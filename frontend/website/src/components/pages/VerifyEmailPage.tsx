import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setVerificationState("error");
      setMessage(
        "Invalid verification link. Please check your email and try again."
      );
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        "https://ecommerce-fashion-app-som7.vercel.app/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setVerificationState("success");
        setMessage(
          "Email verified successfully! You can now login to your account."
        );

        // Store the token if provided
        if (data?.token) {
          try {
            localStorage.setItem("token", data.token);
          } catch {}
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setVerificationState("error");
        setMessage(
          data?.message || "Email verification failed. Please try again."
        );
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setVerificationState("error");
      setMessage(
        text || "Network error. Please check your connection and try again."
      );
    }
  };

  const handleResendVerification = async () => {
    const email = prompt("Please enter your email address:");
    if (!email) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch(
        "https://ecommerce-fashion-app-som7.vercel.app/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResendMessage(
          "Verification email sent successfully! Please check your inbox."
        );
      } else {
        setResendMessage(data?.message || "Failed to send verification email.");
      }
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      setResendMessage(text || "Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-beige to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {verificationState === "loading" && (
          <>
            <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-beige animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-beige mb-4">
              Verifying Email
            </h1>
            <p className="text-beige mb-6">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {verificationState === "success" && (
          <>
            <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-beige" />
            </div>
            <h1 className="text-2xl font-bold text-beige mb-4">
              Email Verified!
            </h1>
            <p className="text-beige mb-6">{message}</p>
            <div className="bg-beigeborder border-beige rounded-lg p-4 mb-6">
              <p className="text-beige text-sm">
                Welcome to Flaunt By Nishi! You'll be redirected to the homepage
                in a few seconds.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-[#2B463C] to-[#688F4E] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Go to Homepage
            </button>
          </>
        )}

        {verificationState === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-beige mb-4">
              Verification Failed
            </h1>
            <p className="text-beige mb-6">{message}</p>

            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full bg-tertiary text-white py-3 rounded-lg font-semibold hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>

              {resendMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    resendMessage.includes("successfully")
                      ? "bg-beigeborder border-beige text-beige"
                      : "bg-red-50 border border-red-200 text-red-800"
                  }`}
                >
                  {resendMessage}
                </div>
              )}

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-tertiary text-white py-3 rounded-lg font-semibold hover:bg-tertiary transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
