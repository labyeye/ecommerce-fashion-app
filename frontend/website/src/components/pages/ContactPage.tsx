import React, { useState } from "react";
import Header from "../Home/Header";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";

const ContactPage: React.FC = () => {
  const handleCartClick = () => {};
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status
    setSubmitStatus({ type: null, message: '' });
    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Message sent successfully! We will get back to you soon.'
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-white via-background/30 to-white">
      <Header cartCount={0} onCartClick={handleCartClick} />

      <main>
        <section className="pt-32 pb-20" style={{ backgroundColor: "#FFF2E1" }}>
          <div className="text-center max-w-7xl mx-auto">
            <span
              className="text-5xl sm:text-6xl font-bold mb-6"
              style={{ color: "#95522C" }}
            >
              Contact Us
            </span>
            <p
              className="text-xl max-w-2xl mx-auto"
              style={{ color: "#95522C" }}
            >
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>
        </section>
        <section className="bg-[#FFF2E1] backdrop-blur-sm">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="backdrop-blur-sm rounded-3xl p-8 mb-20 shadow-lg border border-white/20">
                <span
                  className="text-5xl font-bold mb-6 block text-center"
                  style={{ color: "#95522C" }}
                >
                  Send us a message
                </span>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Status Message */}
                  {submitStatus.type && (
                    <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                      submitStatus.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {submitStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span>{submitStatus.message}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-lg font-medium mb-2"
                        style={{ color: "#95522C" }}
                      >
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-background placeholder-tertiary border border-tertiary rounded-xl transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{
                          boxShadow: "none",
                          outlineColor: "transparent",
                        }}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-lg font-medium mb-2"
                        style={{ color: "#95522C" }}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-background placeholder-tertiary border border-tertiary rounded-xl transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:border-transparent"
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
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-background placeholder-tertiary border border-tertiary rounded-xl transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{ boxShadow: "none" }}
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-lg font-medium mb-2"
                        style={{ color: "#95522C" }}
                      >
                        Your Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={3}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 bg-background placeholder-tertiary border border-tertiary rounded-xl transition-all duration-300 disabled:opacity-50 focus:outline-none focus:ring-2 focus:border-transparent"
                        style={{ boxShadow: "none" }}
                        placeholder="Type your message here..."
                      ></textarea>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:shadow-xl hover:scale-105 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ backgroundColor: "#95522C", color: "#fff" }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
              <div className="space-y-8">
                <div className="bg-[#FFF2E1] backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
                  <span className="text-5xl font-bold text-dark mb-6">
                    <span className="bg-gradient-to-r from-tertiary to-secondary bg-clip-text text-transparent">
                      Contact Information
                    </span>
                  </span>
                  <div className="space-y-6 mt-10">
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
                        <p style={{ color: "#95522C" }} className="federo-numeric">+91 8678040000</p>
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
                          Brc compound, Udhna, Surat,
                        </p>
                        <p style={{ color: "#95522C" }} className="federo-numeric">394210</p>
                      </div>
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
