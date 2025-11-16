import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Overview from "./components/Overview";
import Customers from "./components/Customers";
import Orders from "./components/Orders";
import Products from "./components/Products";
import Marketing from "./components/Marketing";
import PromoCodes from "./components/PromoCodes";
import AddProduct from "./components/AddProduct";
import ProductDetails from "./components/ProductDetails";
import CustomerDetails from "./components/CustomerDetails";
import OrderDetails from "./components/OrderDetails";
import CampaignDetails from "./components/CampaignDetails";
import Analytics from "./components/Analytics";
import Login from "./components/Login";
import EditProduct from "./components/EditProduct";
import NavigationManagement from "./components/NavigationManagement";
import CategoryManagement from "./components/CategoryManagement";
import HeroManagement from "./components/HeroManagement";
import BlogManagement from "./components/BlogManagement";
import Newsletter from "./components/Newsletter";

import { Menu } from "lucide-react";

interface ViewState {
  section: string;
  view: "list" | "add" | "details" | "edit";
  itemId?: string;
}

function DashboardApp() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [currentView, setCurrentView] = useState<ViewState>({
    section: "overview",
    view: "list",
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [mobileOpen]);

  // If not authenticated, show login
  if (!user) {
    return <Login />;
  }

  // If not admin, show access denied
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // Handle Add Product
    if (currentView.view === "add" && currentView.section === "products") {
      return (
        <AddProduct
          onBack={() => setCurrentView({ section: "products", view: "list" })}
          onSave={(product) => {
            console.log("Saving product:", product);
            setCurrentView({ section: "products", view: "list" });
          }}
        />
      );
    }

    // Handle Edit Product
    if (
      currentView.view === "edit" &&
      currentView.section === "products" &&
      currentView.itemId
    ) {
      return (
        <EditProduct
          productId={currentView.itemId}
          onBack={() => setCurrentView({ section: "products", view: "list" })}
          onSave={() => {
            console.log("Product updated successfully");
            setCurrentView({ section: "products", view: "list" });
          }}
        />
      );
    }

    // Handle Detail Views
    if (currentView.view === "details") {
      switch (currentView.section) {
        case "orders":
          return (
            <OrderDetails
              orderId={currentView.itemId || ""}
              onBack={() => setCurrentView({ section: "orders", view: "list" })}
            />
          );
        case "customers":
          return (
            <CustomerDetails
              customerId={currentView.itemId || ""}
              onBack={() => setCurrentView({ section: "customers", view: "list" })}
            />
          );
        default:
          break;
      }
    }

    // Handle List Views
    switch (currentView.section) {
      case "overview":
        return <Overview />;
      case "customers":
        return (
          <Customers
            onViewDetails={(customerId) =>
              setCurrentView({
                section: "customers",
                view: "details",
                itemId: customerId,
              })
            }
          />
        );
      case "orders":
        return (
          <Orders
            onViewDetails={(orderId) =>
              setCurrentView({
                section: "orders",
                view: "details",
                itemId: orderId,
              })
            }
          />
        );
      case "products":
        return (
          <Products
            onAddProduct={() =>
              setCurrentView({ section: "products", view: "add" })
            }
            onViewDetails={(productId) =>
              setCurrentView({
                section: "products",
                view: "edit",
                itemId: productId,
              })
            }
          />
        );
      case "categories":
        return <CategoryManagement />;
      case "marketing":
        return (
          <Marketing
            onViewDetails={(campaignId) =>
              setCurrentView({
                section: "marketing",
                view: "details",
                itemId: campaignId,
              })
            }
          />
        );
      case "promo-codes":
        return <PromoCodes />;
      case "heroes":
        return <HeroManagement />;
      case "blogs":
        return <BlogManagement />;
      case "navigation":
        return <NavigationManagement />;
      case "analytics":
        return <Analytics />;
      case "newsletter":
        return <Newsletter />;
      case "alerts":
        return (
          <div className="p-8 text-center text-gray-500">
            Alerts section coming soon...
          </div>
        );
      case "security":
        return (
          <div className="p-8 text-center text-gray-500">
            Security section coming soon...
          </div>
        );
      case "settings":
        return (
          <div className="p-8 text-center text-gray-500">
            Settings section coming soon...
          </div>
        );
      default:
        return <Overview />;
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setCurrentView({ section, view: "list" });
  };

  return (
    <div className="flex min-h-screen bg-ds-200 text-ds-900">
      {/* Sidebar (desktop) and mobile overlay when open */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(s: string) => {
          handleSectionChange(s);
          setMobileOpen(false);
        }}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Topbar for mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-2 border-b border-ds-300 bg-ds-100">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded hover:bg-ds-200"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-ds-900" />
        </button>
        <div className="text-sm font-semibold text-ds-900 truncate max-w-xs text-center">{getSectionTitle(activeSection)}</div>
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full bg-ds-200">
            <svg className="w-4 h-4 text-ds-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"/></svg>
          </button>
          <div className="w-7 h-7 rounded-full bg-ds-700 text-ds-100 flex items-center justify-center text-xs">{user?.firstName?.[0] ?? 'A'}</div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-0 md:ml-64 overflow-x-hidden">
        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ds-900">{getSectionTitle(activeSection)}</h1>
            <p className="text-sm text-ds-700 mt-1">Admin panel — manage {getSectionTitle(activeSection).toLowerCase()}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input type="search" placeholder="Search..." className="pl-3 pr-8 py-2 rounded-lg border border-ds-200 bg-white text-sm" />
              <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ds-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/></svg>
            </div>
            <button className="px-4 py-2 bg-ds-700 text-ds-100 rounded-lg">New</button>
            <div className="w-8 h-8 rounded-full bg-ds-700 text-ds-100 flex items-center justify-center text-sm">{user?.firstName?.[0] ?? 'A'}</div>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
}

function getSectionTitle(section: string) {
  const map: { [k: string]: string } = {
    overview: 'Overview',
    analytics: 'Analytics',
    customers: 'Customers',
    orders: 'Orders',
    products: 'Products',
    categories: 'Categories',
    newsletter: 'Newsletter',
    heroes: 'Hero Slider',
    blogs: 'Blogs',
    'promo-codes': 'Promo Codes',
    navigation: 'Navigation',
    alerts: 'Alerts',
    security: 'Security',
    settings: 'Settings',
    marketing: 'Marketing'
  };
  return map[section] || section.charAt(0).toUpperCase() + section.slice(1);
}

function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}

export default App;
