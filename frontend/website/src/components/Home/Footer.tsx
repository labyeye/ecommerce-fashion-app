import React, { useEffect, useState } from "react";
import { Facebook, Instagram, Star } from "lucide-react";
import axios from "axios";
import photo from "../../assets/IMG_6285.webp";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: 5,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const sandSvg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 40 40'>
        <defs>
          <pattern id='p' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'>
            <rect x='0' y='0' width='40' height='40' fill='%23f2e0cb' />
            <!-- fine grain -->
            <circle cx='4' cy='5' r='0.5' fill='rgba(0,0,0,0.035)' />
            <circle cx='12' cy='14' r='0.45' fill='rgba(0,0,0,0.02)' />
            <circle cx='28' cy='8' r='0.55' fill='rgba(0,0,0,0.03)' />
            <circle cx='20' cy='30' r='0.4' fill='rgba(0,0,0,0.02)' />
            <!-- small clusters -->
            <g fill='rgba(0,0,0,0.03)'>
              <circle cx='6' cy='28' r='0.25' />
              <circle cx='7.5' cy='29' r='0.2' />
              <circle cx='8.5' cy='27.5' r='0.18' />
            </g>
            <!-- subtle lines to suggest dunes -->
            <path d='M0 32 Q10 28 20 32 T40 32 V40 H0 Z' fill='rgba(255,255,255,0.02)' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill='url(%23p)' />
      </svg>`;

  const sandDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sandSvg)}`;

  useEffect(() => {
    const loadAvg = async () => {
      try {
        const res = await axios.get(
          "https://ecommerce-fashion-app-som7.vercel.app/api/reviews?limit=50"
        );
        const data = res.data && res.data.data ? res.data.data : [];
        if (data.length === 0) return setAvgRating(null);
        const sum = data.reduce((s: number, r: any) => s + (r.rating || 0), 0);
        setAvgRating(Number((sum / data.length).toFixed(1)));
      } catch (err) {
        console.error("Failed to load ratings:", err);
      }
    };
    loadAvg();
    const loadCategories = async () => {
      try {
        const res = await axios.get("https://ecommerce-fashion-app-som7.vercel.app/api/categories");
        const data = res.data && res.data.data ? res.data.data : [];
        setCategories(data.slice(0, 10));
      } catch (err) {
        console.error("Failed to load categories for footer:", err);
      }
    };
    loadCategories();
  }, [refreshKey]);

  return (
    // subtle SVG sand texture applied via data URL

    <footer
      className="bg-[#f2e0cb] text-dark"
      style={{
        backgroundImage: `linear-gradient(rgba(242,224,203,0.82), rgba(242,224,203,0.82)), url(${photo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-30 items-start pl-8 sm:pl-10 lg:pl-12">
          <div className="lg:col-span-1">
            <div className="flex items-start space-x-2 mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl font-bold text-dark">
                Flaunt by Nishi
              </span>
            </div>
            <p className="text-sm sm:text-base text-dark mb-4 sm:mb-6 leading-relaxed max-w-[190px]">
              Fashion that speaks your language. Curated collections for the
              modern wardrobe. Style without compromise.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 mr-1 ${
                        avgRating !== null && i < Math.round(avgRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">
                  {avgRating ?? "-"} / 5
                </span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="text-sm bg-primary text-background px-3 py-1 rounded-md shadow hover:brightness-95 transition"
              >
                Rate us
              </button>
            </div>
            <div className="flex space-x-3 sm:space-x-4">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-tertiary/20 hover:scale-110 transition-all duration-300">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-8 h-8 sm:w-10 sm:h-10 bg-tertiary/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-green-100 hover:scale-110 transition-all duration-300"
              >
                {/* WhatsApp SVG (inline) */}
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-black-600"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M20.52 3.48A11.88 11.88 0 0012 .5C6.21.5 1.5 5.21 1.5 11c0 1.94.51 3.84 1.48 5.5L.5 22.5l6.2-2.05A11.88 11.88 0 0012 22.5c5.79 0 10.5-4.71 10.5-10.5 0-3.02-1.18-5.83-3.98-8.52zM12 20.5c-1.5 0-2.96-.38-4.26-1.09l-.3-.17-3.68 1.22 1.22-3.58-.2-.34A8.5 8.5 0 013.5 11c0-4.7 3.8-8.5 8.5-8.5 2.27 0 4.4.88 6 2.48 1.6 1.6 2.48 3.74 2.48 6 0 4.7-3.8 8.5-8.5 8.5z" />
                  <path d="M17.1 14.2c-.3-.15-1.75-.86-2.02-.96-.27-.1-.46-.15-.66.15s-.76.96-.93 1.16c-.17.2-.33.22-.62.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.33.46-.5.16-.17.22-.28.33-.47.1-.2.04-.37-.02-.51-.07-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.51l-.56-.01c-.2 0-.52.07-.8.37-.28.3-1.08 1.05-1.08 2.56 0 1.5 1.11 2.95 1.26 3.15.15.2 2.18 3.33 5.29 4.67 3.12 1.35 3.12.9 3.69.84.57-.06 1.75-.71 2-1.4.24-.7.24-1.3.17-1.4-.07-.1-.27-.15-.57-.3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div className="lg:col-span-1 ml-16 sm:ml-20 lg:ml-24">
            <h4 className="text-2xl font-semibold mb-6 text-dark">
              <span className="text-transparent bg-clip-text bg-black">
                Categories
              </span>
            </h4>
            <ul className="space-y-2">
              {categories.length === 0 && (
                <li className="text-sm text-dark/70">No categories</li>
              )}
              {categories.map((cat) => (
                <li key={cat._id}>
                  <a
                    href={`/category/${cat.slug}`}
                    className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="lg:col-span-1 ml-16 sm:ml-20 lg:ml-24 ">
            <h4 className="text-2xl font-semibold mb-6 text-dark ">
              <span className="text-transparent bg-clip-text bg-black">
                Company
              </span>
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="bg-clip-text text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Our Story
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Quality Promise
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-1 ml-16 sm:ml-20 lg:ml-24">
            <h4 className="text-2xl font-semibold mb-6 text-dark ">
              <span className="text-transparent bg-clip-text bg-black">
                Support
              </span>
            </h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Shipping Info
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Size Guide
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-dark/80">
              <span>
                &copy; {currentYear} Flaunt by Nishi. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-dark/80 hover:text-dark text-sm transition-colors duration-200"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-dark/80 hover:text-dark text-sm transition-colors duration-200"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-dark/80 hover:text-dark text-sm transition-colors duration-200"
              >
                Cookie Policy
              </a>
            </div>
            <div className="flex items-center space-x-2 text-[#2D2D2D]/80">
              <a
                href="https://pixelatenest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-dark transition-colors duration-200"
              >
                Developed by Pixelate Nest
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your email"
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex items-center space-x-2">
                <label className="text-sm">Rating:</label>
                <select
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: Number(e.target.value) })
                  }
                  className="border px-2 py-1 rounded"
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v} star{v > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Your review"
                className="w-full border px-3 py-2 rounded h-24"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 rounded border"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!form.name || !form.email || !form.message)
                      return alert("Please fill all fields");
                    setSubmitting(true);
                    try {
                      await axios.post(
                        "https://ecommerce-fashion-app-som7.vercel.app/api/reviews",
                        form
                      );
                      setShowModal(false);
                      setForm({ name: "", email: "", rating: 5, message: "" });
                      setRefreshKey((k) => k + 1);
                    } catch (err) {
                      console.error("Submit review failed", err);
                      alert("Failed to submit review");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="px-3 py-1 rounded bg-primary text-background disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
