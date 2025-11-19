type ConsentValue = "accepted" | "rejected";

const STORAGE_KEY = "cookie_consent";

export function getConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) return null;
    if (v === "accepted" || v === "rejected") return v as ConsentValue;
    return null;
  } catch (e) {
    return null;
  }
}

export function setConsent(value: ConsentValue) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
    // notify other tabs
    window.dispatchEvent(new CustomEvent("cookie_consent_changed", { detail: { value } }));
  } catch (e) {
    // ignore
  }
}

export function onConsentChange(cb: (value: ConsentValue | null) => void) {
  const handler = (e: Event) => {
    // @ts-ignore
    const v = (e as CustomEvent).detail?.value as ConsentValue | undefined;
    cb(v ?? null);
  };
  window.addEventListener("cookie_consent_changed", handler as EventListener);
  return () => window.removeEventListener("cookie_consent_changed", handler as EventListener);
}

// Set a cookie only when consent allows non-essential cookies. Note: HTTP-only
// cookies cannot be set from JS and are considered essential for auth.
export function setCookieIfAllowed(
  name: string,
  value: string,
  days = 7,
  options: { path?: string } = {},
  essential = false
) {
  const consent = getConsent();
  if (!essential && consent !== "accepted") {
    // Do not set non-essential cookies without explicit consent
    return false;
  }

  try {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};`;
    if (days) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      cookie += `expires=${expires};`;
    }
    cookie += `path=${options.path ?? "/"};`;
    document.cookie = cookie;
    return true;
  } catch (e) {
    return false;
  }
}

export function getCookie(name: string) {
  try {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
  } catch (e) {
    return null;
  }
}

export default {
  getConsent,
  setConsent,
  onConsentChange,
  setCookieIfAllowed,
  getCookie,
};
