import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCartContext } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from "./components/Home/Header";

// ScrollToTopOnMount component
function ScrollToTopOnMount() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Scroll to top immediately when the route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import Cart from "./components/Home/Cart";
import Footer from "./components/Home/Footer";
import LoadingMountainSunsetBeach from "./components/ui/LoadingMountainSunsetBeach";
import HomePage from "./components/pages/HomePage";
import AboutPage from "./components/pages/AboutPage";
import ProductPage from "./components/pages/ProductsPage";
import ContactPage from "./components/pages/ContactPage";
import UpdatesPage from "./components/pages/UpdatesPage";
import BlogsPage from "./components/pages/BlogsPage";
import ProfilePage from "./components/pages/ProfilePage";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProductDetailsPage from "./components/pages/ProductDetailsPage";
import OrderDetailPage from "./components/pages/OrderDetailPage";
import Dashboard from "./components/pages/Dashboard";
import NewsletterPage from './components/pages/NewsletterPage';
import CheckoutPage from './components/pages/CheckoutPage';
import VerifyEmailPage from './components/pages/VerifyEmailPage';
import Wishlist from "./components/pages/Wishlist";
import AddressesPage from './components/pages/AddressesPage';
import OrderCompletePage from './components/pages/OrderCompletePage';
import TermsPage from './components/pages/TermsPage';
import PrivacyPage from './components/pages/PrivacyPage';
import FaqPage from './components/pages/FaqPage';
import ReturnPolicy from './components/pages/ReturnPolicy';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Show a one-time splash on initial load that cycles all logos once
  const [showSplash, setShowSplash] = useState(true);
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            {showSplash ? (
              <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
                <LoadingMountainSunsetBeach text="Welcome" loop={false} onComplete={() => setShowSplash(false)} />
              </div>
            ) : null}
            <ScrollToTopOnMount />
            <div className="min-h-screen bg-white">
              <HeaderWithCartCount onCartClick={() => setIsCartOpen(true)} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/products" element={<ProductPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/updates" element={<UpdatesPage />} />
                <Route path="/blogs" element={<BlogsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/order/:id" element={<OrderDetailPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/newsletter" element={<NewsletterPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/returns" element={<ReturnPolicy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/order-complete" element={<OrderCompletePage />} />
                <Route path="/addresses" element={<AddressesPage />} />
                <Route path="/wishlist" element={<Wishlist />} />
              </Routes>
              <Footer />
              <CartWithContext isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            </div>
            {/* Coming Soon Overlay */}
            {/* <ComingSoon /> */}
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function HeaderWithCartCount({ onCartClick }: { onCartClick: () => void }) {
  const { cartItems } = useCartContext();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  return <Header cartCount={cartCount} onCartClick={onCartClick} />;
}

function CartWithContext({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean, setIsCartOpen: (open: boolean) => void }) {
  const { cartItems, updateQuantity, removeItem } = useCartContext();
  const navigate = useNavigate();
  return (
    <Cart
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      items={cartItems}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeItem}
      onProceedToCheckout={() => {
        setIsCartOpen(false);
        navigate('/checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );
}

export default App;
