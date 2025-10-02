import React, { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Star
} from "lucide-react";
import axios from 'axios';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', rating: 5, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAvg = async () => {
      try {
        const res = await axios.get('https://ecommerce-fashion-app-som7.vercel.app/api/reviews?limit=50');
        const data = res.data && res.data.data ? res.data.data : [];
        if (data.length === 0) return setAvgRating(null);
        const sum = data.reduce((s: number, r: any) => s + (r.rating || 0), 0);
        setAvgRating(Number((sum / data.length).toFixed(1)));
      } catch (err) {
        console.error('Failed to load ratings:', err);
      }
    };
    loadAvg();
  }, [refreshKey]);

  return (
  <footer className="bg-[#f2e0cb] text-dark">
      {/* Newsletter Section */}
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl font-bold text-dark">
                Flaunt by Nishi
              </span>
            </div>
            <p className="text-sm sm:text-base text-dark mb-4 sm:mb-6 leading-relaxed">
              Fashion that speaks your language. Curated collections for the
              modern wardrobe. Style without compromise.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 mr-1 ${avgRating !== null && i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">{avgRating ?? '-'} / 5</span>
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
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-dark">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-lg text-dark/80 hover:text-dark transition-colors duration-200"
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
          <div>
            <h4 className="text-lg font-semibold mb-6 text-dark">Support</h4>
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
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="border px-2 py-1 rounded"
                >
                  {[5,4,3,2,1].map(v => (
                    <option key={v} value={v}>{v} star{v>1?'s':''}</option>
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
                <button onClick={() => setShowModal(false)} className="px-3 py-1 rounded border">Cancel</button>
                <button
                  onClick={async () => {
                    if (!form.name || !form.email || !form.message) return alert('Please fill all fields');
                    setSubmitting(true);
                    try {
                      await axios.post('https://ecommerce-fashion-app-som7.vercel.app/api/reviews', form);
                      setShowModal(false);
                      setForm({ name: '', email: '', rating: 5, message: '' });
                      setRefreshKey(k => k + 1);
                    } catch (err) {
                      console.error('Submit review failed', err);
                      alert('Failed to submit review');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="px-3 py-1 rounded bg-primary text-background disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
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
