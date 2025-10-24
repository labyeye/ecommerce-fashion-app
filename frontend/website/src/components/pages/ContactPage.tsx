import React from "react";
import Header from "../Home/Header";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-background/30 to-white">
      <Header cartCount={0} onCartClick={() => {}} />

      <main>
        <section className="pt-32 pb-3" style={{ backgroundColor: "#FFF2E1" }}>
          <div className="text-center mb-16 max-w-7xl mx-auto">
            <h2
              className="text-6xl sm:text-6xl font-bold mb-6"
              style={{ color: "#95522C" }}
            >
              Contact Us
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "#95522C" }}
            >
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>
        </section>
        <section className="py-12 bg-[#FFF2E1] backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                <h2
                  className="text-4xl font-bold mb-6"
                  style={{ color: "#95522C" }}
                >
                  Send us a message
                </h2>
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-lg font-medium mb-2"
                      style={{ color: "#95522C" }}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{ boxShadow: "none", outlineColor: "transparent" }}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-lg font-medium mb-2"
                      style={{ color: "#95522C" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{ boxShadow: "none" }}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-lg font-medium mb-2"
                      style={{ color: "#95522C" }}
                    >
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{ boxShadow: "none" }}
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-lg font-medium mb-2"
                      style={{ color: "#95522C" }}
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{ boxShadow: "none" }}
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                    style={{ backgroundColor: "#95522C", color: "#fff" }}
                  >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>
              <div className="space-y-8">
                <div className="bg-[#FFF2E1] backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                  <h2 className="text-4xl font-bold text-dark mb-6">
                    <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
                      Contact Information
                    </span>
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(149,82,44,0.06)" }}
                      >
                        <Mail
                          className="w-5 h-5"
                          style={{ color: "#95522C" }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: "#95522C" }}
                        >
                          Email
                        </h3>
                        <p style={{ color: "#95522C" }}>
                          flauntbynishi@gmail.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(149,82,44,0.06)" }}
                      >
                        <Phone
                          className="w-5 h-5"
                          style={{ color: "#95522C" }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: "#95522C" }}
                        >
                          Phone
                        </h3>
                        <p style={{ color: "#95522C" }}>+91 79871 47114</p>
                        <p style={{ color: "#95522C" }}>Mon-Fri: 9AM - 6PM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "rgba(149,82,44,0.06)" }}
                      >
                        <MapPin
                          className="w-5 h-5"
                          style={{ color: "#95522C" }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: "#95522C" }}
                        >
                          Address
                        </h3>
                        <p style={{ color: "#95522C" }}>
                          W 12 Laxminarayan Estate ,
                        </p>
                        <p style={{ color: "#95522C" }}>
                          {" "}
                          Brc compound, Udhana
                        </p>
                        <p style={{ color: "#95522C" }}>Surat,394210</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#FFF2E1] backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                  <h2
                    className="text-3xl font-bold mb-6"
                    style={{ color: "#95522C" }}
                  >
                    FAQs
                  </h2>
                  <div className="space-y-4">
                    <div className="border-b border-tertiary/30 pb-4">
                      <h3
                        className="font-semibold"
                        style={{ color: "#95522C" }}
                      >
                        What are your shipping options?
                      </h3>
                      <p style={{ color: "#95522C" }} className="mt-1">
                        We offer standard (3-5 days) and express (1-2 days)
                        shipping across India. Free shipping on orders over
                        ₹1000.
                      </p>
                    </div>
                    <div className="border-b border-tertiary/30 pb-4">
                      <h3
                        className="font-semibold"
                        style={{ color: "#95522C" }}
                      >
                        How can I track my order?
                      </h3>
                      <p style={{ color: "#95522C" }} className="mt-1">
                        You'll receive a tracking link via email and SMS once
                        your order ships. You can also check in your account
                        dashboard.
                      </p>
                    </div>
                    <div className="border-b border-tertiary/30 pb-4">
                      <h3
                        className="font-semibold"
                        style={{ color: "#95522C" }}
                      >
                        What's your return policy?
                      </h3>
                      <p style={{ color: "#95522C" }} className="mt-1">
                        We accept returns within 7 days of delivery for unopened
                        products. Please contact our support team to initiate a
                        return.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
