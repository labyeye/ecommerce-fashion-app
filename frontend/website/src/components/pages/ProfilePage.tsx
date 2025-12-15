import LoadingMountainSunsetBeach from "../ui/LoadingMountainSunsetBeach";
import React, { useState, useEffect, useRef } from "react";
import Invoice from "../Invoice";
import { useNavigate, useLocation } from "react-router-dom";
import ProfilePictureUpload from "../ui/ProfilePictureUpload";
import { useAuth } from "../../context/AuthContext";
import { AVATAR_LIST } from "../../utils/avatars";
import {
  User,
  Package,
  Heart,
  Settings,
  // Crown,
  // Star,
  // Award,
  MapPin,
  Phone,
  Mail,
  Key,
  Shield,
  // TrendingUp,
  X,
  Save,
  ChevronRight,
  // FileArchive,
  ScrollText,
  Undo2,
  // Handshake,
} from "lucide-react";
// Inline compact settings for desktop (avoid importing full SettingsPage)

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, token, logout, setCredentials } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] =
    useState<any>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
  });
  const [saving, setSaving] = useState(false);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [profilePictureUploading, setProfilePictureUploading] = useState(false);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);
  const [isMobile, setMobile] = useState<boolean>(false);
  const _initialTabApplied = useRef(false);

  // Apply `tab` from query/state only once on mount so user can switch tabs afterwards
  useEffect(() => {
    if (_initialTabApplied.current) return;
    try {
      const params = new URLSearchParams(location.search || "");
      const tabParam = params.get("tab");
      const stateTab = (location.state as any)?.tab;
      const tab = tabParam || stateTab;
      if (tab && typeof tab === "string") {
        setActiveTab(tab);
      }
    } catch (err) {
      // ignore malformed URLSearchParams
    }
    _initialTabApplied.current = true;
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleProfilePictureUpload = async (imageUrl: string) => {
    if (!token || !user) {
      alert("Please log in to update your profile picture");
      return;
    }

    setProfilePictureUploading(true);

    try {
      // Validate image URL
      if (!imageUrl || !imageUrl.trim()) {
        throw new Error("Invalid image URL provided");
      }

      const apiBase =
        import.meta.env.VITE_API_URL ||
        "https://ecommerce-fashion-app-som7.vercel.app/api";

      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let response;
      try {
        response = await fetch(`${apiBase}/customer/update-profile-photo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies for CORS
          body: JSON.stringify({
            userId: user._id,
            profilePhotoUrl: imageUrl,
          }),
          signal: controller.signal,
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        // Handle specific fetch errors
        if (fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out. Please check your internet connection and try again."
          );
        }

        // Network errors
        if (!navigator.onLine) {
          throw new Error(
            "No internet connection. Please check your network and try again."
          );
        }

        // CORS or network issues
        throw new Error(
          "Network error: Unable to reach the server. Please try again."
        );
      }

      clearTimeout(timeoutId);

      // Check if response is OK before parsing
      if (!response) {
        throw new Error("No response received from server");
      }

      // Try to parse response
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          throw new Error("Server returned invalid response format");
        }
      } else {
        const responseText = await response.text();
        console.error("Non-JSON response received:", responseText);
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      // Check for successful response
      if (!response.ok) {
        const errorMsg =
          data?.error || data?.message || `Server error: ${response.status}`;
        throw new Error(errorMsg);
      }

      if (!data.success) {
        throw new Error(data.error || data.message || "Profile update failed");
      }

      // Success! Update user context
      try {
        if (setCredentials && token) {
          // Re-fetch authoritative user data using existing token
          await setCredentials(token, undefined as any);
        } else {
          // Fallback to reload if setCredentials is not available
          window.location.reload();
        }

        // Show success message
        alert("Profile picture updated successfully!");
      } catch (err) {
        console.warn("Failed to refresh user after profile update", err);
        // Still reload to show the update
        window.location.reload();
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating profile picture:", err);

      // Show user-friendly error
      alert(
        `Failed to update profile picture:\n\n${errorMessage}\n\nPlease try again or contact support if the issue persists.`
      );
    } finally {
      setProfilePictureUploading(false);
      // Close avatar uploader modal if open (mobile)
      try {
        setShowAvatarUploader(false);
      } catch (e) {
        // ignore
      }
    }
  };

  // Render loading UI while user is being resolved, but keep hooks
  // and effects declared above to avoid changing hook order between renders.
  const isUserLoading = !user;

  const pickDefaultAvatar = (uid?: string | null) => {
    if (!AVATAR_LIST || AVATAR_LIST.length === 0) return "";
    if (!uid) {
      const idx = Math.floor(Math.random() * AVATAR_LIST.length);
      return AVATAR_LIST[idx];
    }
    // deterministic pick based on user id hash so avatar is stable
    let h = 0;
    for (let i = 0; i < uid.length; i++) {
      h = (h << 5) - h + uid.charCodeAt(i);
      h |= 0;
    }
    const idx = Math.abs(h) % AVATAR_LIST.length;
    return AVATAR_LIST[idx];
  };

  const userData = {
    name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
    email: user?.email || "",
    phone: user?.phone || "Not provided",
    address: user?.address
      ? `${user.address.street || ""}, ${user.address.city || ""}, ${
          user.address.state || ""
        }
          ${user.address.zipCode || ""}`
          .replace(/^,\s*/, "")
          .replace(/,\s*,/g, ",")
      : "Not provided",
    joinDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "",
    profileImage: user?.profileImage || pickDefaultAvatar(user?._id),
    totalOrders: orderStats?.total || 0,
    totalSpent: orderStats?.totalSpent || 0,
  };

  if (isUserLoading) {
    return <LoadingMountainSunsetBeach text="Loading profile..." />;
  }

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "India",
        },
      });
    }
  }, [user]);

  const handleEditProfile = () => {
    setShowEditModal(true);
  };
  const handleSaveProfile = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiBase}/api/customer/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          address: editForm.address,
        }),
      });

      // Handle response parsing carefully
      let data;
      const responseText = await response.text();

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", responseText);
        throw new Error("Server returned invalid response");
      }

      if (response.ok && data.success) {
        setShowEditModal(false);
        window.location.reload();
      } else {
        throw new Error(
          data.error ||
            data.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Error updating profile:", err);
      alert(`Failed to update profile: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // const tiers = [
  //   {
  //     name: "Bronze",
  //     minPoints: 0,
  //     maxPoints: 999,
  //     color: "#8B7355",
  //     bgColor: "#8B7355",
  //     borderColor: "border-fashion-light-brown",
  //     textColor: "text-fashion-accent-brown",
  //     iconColor: "text-fashion-accent-brown",
  //     icon: Star,
  //     benefits: [
  //       "1 Point on every purchase",
  //       "Welcome bonus: 100 points",
  //       "Standard shipping rates",
  //       "Basic customer support",
  //     ],
  //   },
  //   {
  //     name: "Silver",
  //     minPoints: 999,
  //     maxPoints: 2499,
  //     color: "#9b9b9bff",
  //     bgColor: "#9b9b9bff",
  //     borderColor: "border-fashion-warm-gray",
  //     textColor: "text-fashion-dark-gray",
  //     iconColor: "text-fashion-dark-gray",
  //     icon: Award,
  //     benefits: [
  //       "3 Points on every purchase",
  //       "Priority customer support",
  //       "Free shipping on orders ₹500+",
  //       "Early access to new products",
  //       "Birthday bonus: 500 points",
  //     ],
  //   },
  //   {
  //     name: "Gold",
  //     minPoints: 2499,
  //     maxPoints: 999999,
  //     color: "#fabd25ff",
  //     bgColor: "#fabd25ff",
  //     borderColor: "border-fashion-nude",
  //     textColor: "text-fashion-accent-brown",
  //     iconColor: "text-fashion-accent-brown",
  //     icon: Crown,
  //     benefits: [
  //       "5 Points on every purchase",
  //       "VIP customer support",
  //       "Free shipping on all orders",
  //       "Exclusive product launches",
  //       "Birthday bonus: 1000 points",
  //       "Monthly surprise gifts",
  //       "Personal nutrition consultant",
  //     ],
  //   },
  // ];
  useEffect(() => {
    if (activeTab === "orders" && user && token) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError("");
        try {
          const response = await fetch(
            "https://ecommerce-fashion-app-som7.vercel.app/api/customer/orders",
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          if (!response.ok) {
            if (response.status === 401) {
              console.warn("Orders fetch returned 401 - logging out user");
              logout();
              navigate("/login");
              return;
            }
            throw new Error(data.message || "Failed to fetch orders");
          }
          setOrders(data.data.orders);
        } catch (err: any) {
          setOrdersError(err.message || "Failed to fetch orders");
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, user, token]);

  // invoice helpers
  const handleDownloadInvoice = async (ord: any) => {
    setSelectedOrderForInvoice(ord);
    // give React a moment to render the hidden invoice
    setTimeout(async () => {
      try {
        if (!invoiceRef.current) return;
        const { downloadRefAsPDF } = await import("../../utils/invoice");
        await downloadRefAsPDF(
          invoiceRef.current,
          `invoice-${ord.orderNumber || ord._id}.pdf`
        );
      } catch (err) {
        console.error("Failed to download invoice", err);
        alert("Failed to download invoice");
      }
    }, 300);
  };

  const handlePrintInvoice = (ord: any) => {
    setSelectedOrderForInvoice(ord);
    setTimeout(async () => {
      try {
        if (!invoiceRef.current) return;
        const { printRef } = await import("../../utils/invoice");
        printRef(invoiceRef.current);
      } catch (err) {
        console.error("Failed to print invoice", err);
        alert("Failed to print invoice");
      }
    }, 300);
  };
  useEffect(() => {
    if (user && token) {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch(
            "https://ecommerce-fashion-app-som7.vercel.app/api/customer/dashboard",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const data = await response.json();

          if (response.ok) {
            setOrderStats(data.data.orderStats);
          } else {
            if (response.status === 401) {
              console.warn("Dashboard fetch returned 401 - logging out user");
              logout();
              navigate("/login");
              return;
            }
            console.error("Failed to fetch dashboard data:", data);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      };

      fetchDashboardData();
    }
  }, [user, token]);

  // detect mobile viewport and set state so mobile-only UI can render
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="min-h-screen pt-24 pb-16"
      style={{ backgroundColor: "#FFF2E1" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {isMobile && (
          <div className="bg-beige rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-semibold text-tertiary overflow-hidden">
                {userData.profileImage ? (
                  // show profile image when available
                  // ensure the image covers the container
                  <img
                    src={userData.profileImage}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                    {user?.lastName?.[0]?.toUpperCase() || ""}
                  </>
                )}
              </div>
              <div className="flex-1">
                <div className="text-3xl font-semibold text-tertiary">
                  {userData.name}
                </div>
                <div className="text-xl text-tertiary opacity-90">
                  {userData.email}
                </div>
                <div className="text-lg text-tertiary">
                  Member since {userData.joinDate}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleEditProfile}
                  className="text-xl font-semibold text-tertiary px-6 py-2 border border-tertiary rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowAvatarUploader(true)}
                  className="text-sm font-semibold text-tertiary px-4 py-1 border border-tertiary rounded-md"
                >
                  Change Avatar
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Orders</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              {/* <button
              onClick={() => alert("Ajio Wallet")}
              className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white" />
                <div className="text-xl text-white">Ajio Wallet</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button> */}
              {/* <button
              onClick={() => alert("Invite Friends")}
              className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-white" />
                <div className="text-xl text-white">Invite Friends</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button> */}
              {/* <button
                onClick={() => navigate("/settings")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Payments</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button> */}
              <button
                onClick={() => navigate("/addresses")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Address Book</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => navigate("/wishlist")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Wishlist</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              {/* <button
                onClick={() => navigate("/invite-friends")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <Handshake className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Invite Friends</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button> */}
              <button
                onClick={() => navigate("/terms")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <ScrollText className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Terms and Conditions</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => navigate("/return-policy")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <Undo2 className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Return Policy</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Settings</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>{" "}
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center justify-between bg-tertiary/80 px-4 py-3 rounded-md border"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-white" />
                  <div className="text-xl text-white">Customer Care</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => logout()}
                className="w-full py-3 text-xl rounded-md border border-tertiary text-center font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        {/* Hidden invoice renderer for profile orders */}
        <div
          style={{ position: "absolute", left: -9999, top: 0, width: 800 }}
          aria-hidden
        >
          {/* selectedOrderForInvoice may be null until user clicks Download/Print */}
          {selectedOrderForInvoice && (
            <Invoice order={selectedOrderForInvoice} ref={invoiceRef} />
          )}
        </div>
        {!isMobile && (
          <div className="bg-background rounded-xl border border-fashion-charcoal/10 shadow-soft p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <ProfilePictureUpload
                  currentImage={userData.profileImage}
                  onUpload={handleProfilePictureUpload}
                  loading={profilePictureUploading}
                  authToken={token || ""}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <span className="block font-light text-tertiary tracking-wide mb-3 text-2xl sm:text-2xl md:text-3xl lg:text-4xl">
                  {userData.name}
                </span>
                <span className="block text-tertiary mb-2 text-2xl sm:text-xl md:text-xl">
                  {userData.email}
                </span>
                <span className="block text-tertiary mb-4 text-xl sm:text-lg md:text-lg">
                  Member since {userData.joinDate}
                </span>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-tertiary">
                    <Package className="w-5 h-5" />
                    <span className="font-medium federo-numeric">
                      {userData.totalOrders} Orders
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="mt-4 bg-tertiary text-white px-5 py-2 rounded-lg hover:bg-[#7a3f20] transition-colors flex items-center gap-3 mx-auto md:mx-0 text-lg md:text-base"
                  style={{ boxShadow: "0 2px 6px rgba(149,82,44,0.08)" }}
                >
                  <Settings className="w-5 h-5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {}
        {/* <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-[#FFD700]" />
            <span className="block text-2xl sm:text-2xl md:text-3xl font-bold" style={{ color: "#95522C" }}>
              Loyalty Program
            </span>
          </div>
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              background: "#FFF2E1",
              border: "1px solid rgba(149,82,44,0.06)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xl sm:text-xl md:text-2xl font-bold mb-2" style={{ color: "#95522C" }}>
                  Current Tier: {userData.currentTier.charAt(0).toUpperCase() + userData.currentTier.slice(1)}
                </span>
                <span className="block text-sm sm:text-sm md:text-base" style={{ color: "#5a4a42" }}>
                  Tier Points: {userData.loyaltyPoints} | Evolv Points: {userData.evolvPoints}
                </span>
              </div>
              <Crown className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium" style={{ color: "#5a4a42" }}>
                Progress to {userData.nextTier === "silver" ? "Silver" : "Gold"}
              </span>
              <span className="font-bold" style={{ color: "#95522C" }}>
                {userData.progressToNextTier}% ({userData.loyaltyPoints}/
                {userData.nextTierPoints})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${userData.progressToNextTier}%`,
                  background:
                    "linear-gradient(90deg, #95522C 0%, #D18A6A 100%)",
                }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    isCurrentTier
                      ? `${tier.borderColor} ${tier.bgColor} ring-2 ring-offset-2 ring-opacity-50`
                      : isUnlocked
                      ? `${tier.borderColor} ${tier.bgColor} opacity-90`
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="text-center mb-4">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${tier.bgColor} border-2 ${tier.borderColor} mb-3`}
                    >
                      <Icon
                        className={`w-8 h-8 ${
                          isCurrentTier ? tier.iconColor : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span className={`block font-bold text-lg ${isCurrentTier ? tier.textColor : "text-gray-600"} sm:text-lg md:text-xl`}>{tier.name}</span>
                    <span className="block text-sm sm:text-sm text-tertiary">{tier.minPoints === 0 ? "0" : tier.minPoints.toLocaleString()}+ points</span>
                    {isCurrentTier && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${tier.bgColor} ${tier.textColor}`}
                      >
                        Current Tier
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <span className={`block font-semibold text-sm ${isCurrentTier ? tier.textColor : "text-tertiary"}`}>Benefits:</span>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-xs"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                              isCurrentTier
                                ? tier.iconColor.replace("text-", "bg-")
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <span
                            className={`${
                              isCurrentTier ? "text-tertiary" : "text-tertiary"
                            }`}
                          >
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div> */}

        {}
        {!isMobile && (
          <div className="bg-background rounded-xl border border-fashion-charcoal/10 shadow-soft mb-8">
            <div className="flex flex-wrap border-b border-fashion-charcoal/10">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "orders", label: "Orders", icon: Package },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-300 text-xl ${
                      activeTab === tab.id
                        ? "text-fashion-accent-brown border-b-2 border-fashion-accent-brown"
                        : "text-tertiary/70 hover:text-fashion-accent-brown"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-300 ${
                        activeTab === tab.id
                          ? "text-fashion-accent-brown"
                          : "text-tertiary/70"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {}
            <div className="pt-2 pb-6 px-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {}
                  <div>
                    <span className="block font-light text-tertiary mb-6 tracking-wide text-lg sm:text-lg md:text-xl">
                      Personal Information
                    </span>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-5 bg-background rounded-fashion border border-fashion-charcoal/10 shadow-soft transition-all duration-300 hover:shadow-gentle">
                        <Mail className="w-5 h-5 " />
                        <div>
                          <span className="block text-xl sm:text-lg text-tertiary font-semibold">
                            Email
                          </span>
                          <span className="block text-tertiary font-medium mt-1">
                            {userData.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5 bg-background rounded-fashion border border-fashion-charcoal/10 shadow-soft transition-all duration-300 hover:shadow-gentle">
                        <Phone className="w-5 h-5 " />
                        <div>
                          <span className="block text-xl sm:text-lg text-tertiary font-semibold">
                            Phone
                          </span>
                          <span className="block text-tertiary federo-numeric mt-1">
                            {userData.phone}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-5 bg-background rounded-fashion border border-fashion-charcoal/10 shadow-soft md:col-span-2 transition-all duration-300 hover:shadow-gentle">
                        <MapPin className="w-5 h-5 " />
                        <div>
                          <span className="block text-xl sm:text-lg text-tertiary font-semibold">
                            Address
                          </span>
                          <span className="block text-tertiary font-medium mt-1">
                            {userData.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <span
                    className="block text-xl sm:text-xl md:text-2xl font-bold mb-4"
                    style={{ color: "#95522C" }}
                  >
                    Recent Orders
                  </span>
                  {!token && (
                    <div className="text-center py-8 text-red-600">
                      You are not logged in. Please log in to view your orders.
                    </div>
                  )}
                  {ordersLoading ? (
                    <LoadingMountainSunsetBeach text="Loading orders..." />
                  ) : ordersError ? (
                    <div className="text-center py-8 text-red-600">
                      {ordersError}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-tertiary">
                      No orders found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="border border-tertiary rounded-lg p-4 bg-background shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="block font-semibold federo-numeric"
                              style={{ color: "#95522C" }}
                            >
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <span className="block text-sm sm:text-sm text-tertiary federo-numeric mb-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="block text-sm sm:text-sm text-tertiary mb-2">
                            {order.items
                              .map((item: any) => item.product?.name)
                              .join(", ")}
                          </span>
                          <span className="block text-sm sm:text-sm text-tertiary federo-numeric">
                            ₹{order.total}
                          </span>
                          {order.shipment && (
                            <div className="text-sm text-gray-600 mt-2">
                              {(order.shipment.shipmentId ||
                                order.shipment.awb) && (
                                <span className="block text-tertiary font-semibold">
                                  Delhivery ID:{" "}
                                  <span className="font-medium text-tertiary federo-numeric">
                                    {order.shipment.shipmentId ||
                                      order.shipment.awb}
                                  </span>
                                </span>
                              )}
                              {order.shipment.name && (
                                <span className="block text-xs sm:text-xs text-tertiary mt-1">
                                  Consignee: {order.shipment.name}
                                </span>
                              )}
                              {order.shipment.pincode && (
                                <span className="block text-xs sm:text-xs text-tertiary">
                                  Pincode: {order.shipment.pincode}
                                </span>
                              )}
                            </div>
                          )}

                          {/* <div className="mt-2 p-3 bg-[#688F4E]/10 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-tertiary font-medium">
                              Loyalty Points Earned:
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: "#95522C" }}
                            >
                              {Math.floor(order.total)} points (Tier) +{" "}
                              {Math.floor(
                                order.total *
                                  (user.loyaltyTier === "bronze"
                                    ? 0.1
                                    : user.loyaltyTier === "silver"
                                    ? 0.15
                                    : 0.2)
                              )}{" "}
                              points (Evolv)
                            </span>
                          </div>
                        </div> */}

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => navigate(`/order/${order._id}`)}
                                className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm"
                              >
                                View Details
                              </button>

                              <button
                                onClick={() => handleDownloadInvoice(order)}
                                className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm"
                              >
                                Download Invoice
                              </button>

                              <button
                                onClick={() => handlePrintInvoice(order)}
                                className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm"
                              >
                                Print
                              </button>
                            </div>

                            {order.status === "pending" &&
                              order.payment?.method === "razorpay" &&
                              order.payment?.status !== "paid" && (
                                <button
                                  className="px-4 py-2 bg-tertiary text-white rounded hover:bg-[#7a3f20] transition-colors text-sm"
                                  onClick={() =>
                                    alert(
                                      "Redirect to payment gateway for order " +
                                        order.orderNumber
                                    )
                                  }
                                >
                                  Pay Now
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="w-full bg-background rounded-lg border border-fashion-charcoal/10 p-4 shadow-sm">
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/settings/change-password")}
                      className="flex items-center gap-3 w-full p-3 bg-background rounded-lg hover:bg-background border border-tertiary transition-colors text-left"
                    >
                      <Key className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Change Password</div>
                        <div className="text-sm text-tertiary">
                          Secure your account
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigate("/settings/change-email")}
                      className="flex items-center gap-3 w-full p-3 bg-background rounded-lg hover:bg-background border border-tertiary transition-colors text-left"
                    >
                      <Mail className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Change Email</div>
                        <div className="text-sm text-tertiary">
                          Update your primary email
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className=" pt-4 mt-4 space-y-2">
                    <button
                      onClick={() => logout()}
                      className="w-full p-3 rounded-lg border border-tertiary text-center text-tertiary"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="block text-2xl sm:text-2xl md:text-3xl font-bold text-tertiary">
                  Edit Profile
                </span>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {}
              <div>
                <span className="block text-lg sm:text-base md:text-lg font-semibold text-tertiary mb-4">
                  Personal Information
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      className="w-full border text-lg border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ boxShadow: "0 0 0 3px rgba(149,82,44,0.08)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="w-full border text-lg border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full border text-lg federo-numeric border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {}
              <div>
                <span className="block text-lg sm:text-base md:text-lg font-semibold text-tertiary mb-4">
                  Address Information
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editForm.address.street}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full border text-lg border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.address.city}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="w-full border text-lg border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={editForm.address.state}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            state: e.target.value,
                          },
                        })
                      }
                      className="w-full border text-lg border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={editForm.address.zipCode}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            zipCode: e.target.value,
                          },
                        })
                      }
                      className="w-full border text-lg federo-numeric border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-medium text-tertiary mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={editForm.address.country}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          address: {
                            ...editForm.address,
                            country: e.target.value,
                          },
                        })
                      }
                      className="w-full border text-lg border-tertiary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 text-lg border border-tertiary rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-3 bg-tertiary text-lg text-white rounded-lg hover:bg-[#5a7a42] transition-colors disabled:bg-gray-400 flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <LoadingMountainSunsetBeach text="Saving..." />
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showAvatarUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="block text-xl font-bold text-tertiary">
                Change Avatar
              </span>
              <button
                onClick={() => setShowAvatarUploader(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <ProfilePictureUpload
                currentImage={userData.profileImage}
                onUpload={handleProfilePictureUpload}
                loading={profilePictureUploading}
                authToken={token || ""}
              />
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAvatarUploader(false)}
                className="px-4 py-2 border rounded-md text-tertiary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
