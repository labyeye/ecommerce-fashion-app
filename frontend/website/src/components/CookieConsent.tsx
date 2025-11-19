import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, setConsent } from "../utils/cookieConsent";

const CookieConsent: React.FC = () => {
  const [consent, setLocalConsent] = useState<string | null>(null);

  useEffect(() => {
    setLocalConsent(getConsent());
  }, []);

  const acceptAll = () => {
    setConsent("accepted");
    setLocalConsent("accepted");
  };

  const rejectNonEssential = () => {
    setConsent("rejected");
    setLocalConsent("rejected");
  };

  if (consent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 text-sm md:text-base text-gray-800">
            <div className="font-semibold text-tertiary">We use cookies</div>
            <div className="mt-1 text-sm text-tertiary">
              We use essential cookies for login and checkout. Optional cookies
              (analytics, personalization and advertising) are used only with
              your consent. You can accept all or reject non-essential cookies.
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center gap-3">

            <button
              onClick={rejectNonEssential}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm text-tertiary bg-white hover:bg-gray-50"
              aria-label="Reject non-essential cookies"
            >
              Reject
            </button>

            <button
              onClick={acceptAll}
              className="px-3 py-2 rounded-md bg-fashion-accent-brown text-white text-sm hover:brightness-95"
              aria-label="Accept all cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
