import React from "react";

interface GlobalAuthLoaderProps {
  isVisible: boolean;
  message?: string;
}

const GlobalAuthLoader: React.FC<GlobalAuthLoaderProps> = ({
  isVisible,
  message = "Signing you in...",
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center"
      style={{ pointerEvents: "all" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        {/* Animated Logo/Spinner */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-20 h-20">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-4 border-[#95522C]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[#95522C] rounded-full animate-spin"></div>

            {/* Inner pulsing circle */}
            <div className="absolute inset-3 bg-[#FFF2E1] rounded-full animate-pulse flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[#95522C]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Message */}
        <h3 className="text-2xl font-bold text-[#95522C] mb-2">{message}</h3>
        <p className="text-gray-600 text-sm">
          Please wait while we set up your account...
        </p>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div
            className="w-2 h-2 bg-[#95522C] rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#95522C] rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-[#95522C] rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAuthLoader;
