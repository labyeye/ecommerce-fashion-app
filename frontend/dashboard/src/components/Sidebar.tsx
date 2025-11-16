import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  Megaphone,
  Settings,
  Home,
  Shield,
  AlertTriangle,
  LogOut,
  X,
  User,
  Percent,
  Image,
  Navigation,
  FileText,
  Folder,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  // mobileOpen controls whether the mobile overlay sidebar is visible
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  mobileOpen = false,
  onClose,
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "overview", icon: Home, label: "Overview" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "customers", icon: Users, label: "Customers" },
    { id: "orders", icon: ShoppingCart, label: "Orders" },
    { id: "products", icon: Package, label: "Products" },
    { id: "categories", icon: Folder, label: "Categories" },
    { id: "newsletter", icon: Megaphone, label: "Newsletter" },
    { id: "heroes", icon: Image, label: "Hero Slider" },
    { id: "blogs", icon: FileText, label: "Blogs" },
    { id: "promo-codes", icon: Percent, label: "Promo Codes" },
    { id: "navigation", icon: Navigation, label: "Navigation" },
    { id: "alerts", icon: AlertTriangle, label: "Alerts" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  // Animated slide-in sidebar: fixed overlay on small screens (so it doesn't
  // take layout space), and a normal relative sidebar on md+ screens.
  const baseClasses =
    "fixed inset-y-0 left-0 z-50 md:relative md:z-auto bg-ds-800 text-ds-100 w-64 flex flex-col shadow-2xl transform transition-transform duration-300";
  const translateClass = mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0";
  const containerClasses = `${baseClasses} ${translateClass} md:flex`;

  // Accessibility: close on Escape, trap focus while mobile sidebar is open,
  // and restore focus when closed.
  React.useEffect(() => {
    if (!mobileOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const sidebarEl = document.querySelector(
      'div[role="dialog"]'
    ) as HTMLElement | null;

    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusable = sidebarEl
      ? Array.from(sidebarEl.querySelectorAll<HTMLElement>(focusableSelector))
      : [];

    // focus first focusable element (close button) if available
    if (focusable.length) {
      focusable[0].focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose && onClose();
        return;
      }

      if (e.key === "Tab" && focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [mobileOpen, onClose]);

  return (
    <>
      {/* Backdrop for mobile when sidebar is open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => onClose && onClose()}
        />
      )}

      <div
        className={containerClasses}
        {...(mobileOpen ? { role: "dialog", "aria-modal": "true" } : {})}
      >
        {/* Mobile close button */}
        {mobileOpen && (
          <div className="p-4 md:hidden border-b border-ds-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ds-100">Flaunt By Nishi</h2>
            <button
              onClick={() => onClose && onClose()}
              className="p-2 rounded hover:bg-ds-700"
            >
              <X className="w-5 h-5 text-ds-100" />
            </button>
          </div>
        )}
        {!mobileOpen && (
          <div className="p-6 border-b border-ds-700">
            <h1 className="text-xl font-bold text-ds-100">Commerce Hub</h1>
            <p className="text-sm text-ds-200 mt-1">Admin Dashboard</p>
          </div>
        )}

        <nav className="mt-6 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-all rounded-full duration-200 hover:bg-ds-700 ${
                  isActive
                    ? "bg-ds-100 text-ds-900 border-r-20 border-ds-300"
                    : "text-ds-200 hover:text-ds-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${
                    isActive ? "text-ds-300" : "text-ds-500"
                  }`}
                />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info and Logout */}
        <div className="p-6 border-t border-ds-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-ds-100/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-ds-100" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ds-100">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-ds-200">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-ds-300 hover:bg-ds-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
