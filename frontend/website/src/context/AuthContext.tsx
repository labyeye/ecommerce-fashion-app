import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "customer";
  phone?: string;
  createdAt: string | Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  isEmailVerified: boolean;
  // loyaltyPoints?: number;
  // evolvPoints?: number;
  // loyaltyTier?: string;
  // loyaltyHistory?: any[];
  avatar?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  authInitializing?: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  setCredentials?: (token: string, user: any) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = "http://localhost:3500/api";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitializing, setAuthInitializing] = useState<boolean>(true);
  // const navigate = useNavigate();
  const inactivityTimerRef = useRef<number | null>(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const run = async () => {
      if (token) {
        setAuthInitializing(true);
        await fetchUser(token);
        setAuthInitializing(false);
      } else {
        setAuthInitializing(false);
      }
    };
    run();
  }, [token]);

  const fetchUser = async (tokenArg?: string) => {
    setAuthInitializing(true);
    try {
      // Determine which token to use: explicit arg, state token, or localStorage
      const authToken = tokenArg || token || localStorage.getItem("token");

      // First get basic user data
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // // Then get customer profile with loyalty data
        if (data.user.role === "customer") {
          try {
            const profileResponse = await fetch(
              `${API_BASE_URL}/customer/profile`,
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              // Merge the data
              const mergedUser = {
                ...data.user,
                ...profileData.data,
              };
              setUser(mergedUser);
            } else {
              setUser(data.user);
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            setUser(data.user);
          }
        } else {
          setUser(data.user);
        }
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setAuthInitializing(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      } else {
        setError(data.message || "Login failed");
        return false;
      }
    } catch (error) {
      setError("Network error. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Don't auto-login after registration, email verification required
        // The backend now returns user data without token
        return data; // Return success data for the component to handle
      } else {
        setError(data.message || "Registration failed");
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Network error. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Call backend to clear httpOnly cookie (if present), then clear client state
    (async () => {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.warn("Logout API call failed:", err);
      } finally {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        try {
          window.location.href = "/login";
        } catch (e) {
          // ignore
        }
      }
    })();
  };

  const clearError = () => {
    setError(null);
  };

  // Helper to set credentials after OTP login
  // Helper to set credentials after OTP login
  // Also trigger a server-validated fetch of the user to ensure token is valid.
  const setCredentials = async (newToken: string, newUser?: any) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      // If a user object is provided, set it immediately for optimistic UI
      if (newUser) {
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
      }

      // Validate token by fetching authoritative user data from server
      await fetchUser(newToken);
    } catch (err) {
      console.error("setCredentials error", err);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
    clearError,
    // expose internal setter for OTP flow
    setCredentials,
    authInitializing,
  };

  // Auto-logout / inactivity tracking
  useEffect(() => {
    const INACTIVITY_LIMIT = 2 * 60 * 60 * 1000; // 2 hours
    const LAST_ACTIVITY_KEY = "lastActivity";

    // Only set up timers/listeners when user is logged in (token exists)
    if (!token) return;

    const scheduleLogout = () => {
      // Clear existing
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = window.setTimeout(() => {
        try {
          logout();
        } catch (e) {
          console.warn("Auto-logout failed:", e);
        }
      }, INACTIVITY_LIMIT);
    };

    const recordActivity = () => {
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      } catch (e) {}
      scheduleLogout();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        } catch (e) {}
      }
    };

    const onBeforeUnload = () => {
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
      } catch (e) {}
    };

    // Attach activity listeners
    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    // On mount, check stored lastActivity (useful if tab was closed)
    try {
      const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now().toString());
      const elapsed = Date.now() - last;
      if (elapsed >= INACTIVITY_LIMIT) {
        // Last activity was too long ago — force logout
        logout();
      } else {
        // Start timer for remaining time
        const remaining = INACTIVITY_LIMIT - elapsed;
        if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = window.setTimeout(() => logout(), remaining);
      }
    } catch (e) {
      // fallback: schedule full timeout
      scheduleLogout();
    }

    return () => {
      // cleanup
      events.forEach((ev) => window.removeEventListener(ev, recordActivity as EventListener));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (inactivityTimerRef.current !== null) window.clearTimeout(inactivityTimerRef.current);
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
