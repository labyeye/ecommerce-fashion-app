import React from "react";
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F4F1E9]/30 to-white">
      {/* Header - You might want to pass cart-related props if needed */}
      <Header cartCount={0} onCartClick={() => {}} />

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 bg-gradient-to-br from-[#F4F1E9] to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#2B463C] to-[#688F4E] bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>
        </section>

        {/* Contact Form and Info Section */}
        <section className="py-12 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-[#2B463C] mb-6">Send us a message</h2>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#2B463C] mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#2B463C] mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#2B463C] mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent transition-all duration-300"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#2B463C] mb-2">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#688F4E] focus:border-transparent transition-all duration-300"
                      placeholder="Type your message here..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#2B463C] to-[#688F4E] text-white py-3 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
                  >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Send Message</span>
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                  <h2 className="text-2xl font-bold text-[#2B463C] mb-6">Contact Information</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#688F4E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-[#688F4E]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2B463C]">Email</h3>
                        <p className="text-gray-600">hello@vital.in</p>
                        <p className="text-gray-600">support@vital.in</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#688F4E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-[#688F4E]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2B463C]">Phone</h3>
                        <p className="text-gray-600">+91 98765 43210</p>
                        <p className="text-gray-600">Mon-Fri: 9AM - 6PM</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-[#688F4E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-[#688F4E]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#2B463C]">Address</h3>
                        <p className="text-gray-600">Vital Nutrition Pvt. Ltd.</p>
                        <p className="text-gray-600">123 Wellness Street</p>
                        <p className="text-gray-600">Mumbai, Maharashtra 400001</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                  <h2 className="text-2xl font-bold text-[#2B463C] mb-6">FAQs</h2>
                  <div className="space-y-4">
                    <div className="border-b border-[#B1D182]/30 pb-4">
                      <h3 className="font-semibold text-[#2B463C]">What are your shipping options?</h3>
                      <p className="text-gray-600 mt-1">
                        We offer standard (3-5 days) and express (1-2 days) shipping across India. Free shipping on orders over ₹1000.
                      </p>
                    </div>
                    <div className="border-b border-[#B1D182]/30 pb-4">
                      <h3 className="font-semibold text-[#2B463C]">How can I track my order?</h3>
                      <p className="text-gray-600 mt-1">
                        You'll receive a tracking link via email and SMS once your order ships. You can also check in your account dashboard.
                      </p>
                    </div>
                    <div className="border-b border-[#B1D182]/30 pb-4">
                      <h3 className="font-semibold text-[#2B463C]">What's your return policy?</h3>
                      <p className="text-gray-600 mt-1">
                        We accept returns within 7 days of delivery for unopened products. Please contact our support team to initiate a return.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 bg-gradient-to-br from-[#F4F1E9] to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20 overflow-hidden">
              <h2 className="text-2xl font-bold text-[#2B463C] mb-6">Find Us</h2>
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.715317693022!2d72.8246603153784!3d19.03398725862163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7ce3e3b86137f%3A0x5c3d1c6dc9343f92!2sVital%20Nutrition!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-xl"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;