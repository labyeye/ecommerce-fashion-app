import React from "react";
import logo from "../../assets/images/logoblack.png";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-8 sm:p-12">
          <img
            src={logo}
            alt="Terms and Conditions"
            className="w-48 h-48 mx-auto rounded-lg"
          />
          <h3 className="text-5xl font-semibold text-[#95522C] mb-6 text-center">
            Privacy Policy
          </h3>

          <p className="mb-4 text-2xl mt-4 text-justify">
            We firmly believe in your privacy and the security of your personal
            information. We do not rent, sell or distribute our customer base or
            newsletter e-mails to anyone. We also do not store your credit card
            details on our server, all credit card purchases are processed
            through our secure payment gateway. Your privacy is important to us.
          </p>

          <h3 className="text-5xl font-medium text-[#95522C] mt-6 mb-10 text-center">
            The Information We Collect
          </h3>

          <span className="text-4xl font-medium mt-10 mb-2">• Your Email</span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            You don't like spam. We don't like spam. Because of this, we only
            send our newsletter to email addresses that have opted in, and they
            may opt out at any time. If you place an order with us, we send
            email messages pertaining to your order. We do not sell your email
            address to other parties.
          </p>

          <span className="text-4xl font-medium mt-4 mb-2">
            • Your Personal Information
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            We collect your personal information when you provide it to us as
            you place your order, including your name, shipping and billing
            address, credit card number, and email address. We use this
            information to process your order, provide you with support, and
            update you on your order. We do not sell your personal information
            to other parties.
          </p>

          <span className="text-4xl font-medium mt-4 mb-2">
            • Anonymous Information
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            We collect non-personal information from you, including your browser
            type, the URL of the previous web site you visited, your ISP,
            operating system, etc. This information is anonymous and is
            collected by almost all sites that you visit. We use this
            information, which does not identify individual users, to analyse
            trends, to administer the site, to track users' movements around the
            site and gather demographic information about our user base as a
            whole.
          </p>

          <span className="text-4xl font-medium mt-4 mb-2">• Cookies</span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Like almost all e-commerce websites, we use cookies. Our cookies do
            not store your sensitive personal information, but they help us with
            essential functions (for example keeping items in your shopping
            cart) and to collect anonymous usage data for improving the site.
            You can manage or disable cookies through your browser settings;
            doing so may affect some features of the site.
          </p>

          <h3 className="text-5xl font-medium mt-6 mb-4 text-center">
            What We Use / हम क्या उपयोग करते हैं
          </h3>
          <p className="mb-4 text-2xl mt-4 text-justify">
            We use a few third-party services to provide login, payments,
            shipping, and email features. Below is a short summary in English
            and Hindi so you know which services may process your data:
          </p>

          <ul className="list-disc list-inside mb-4 text-2xl mt-4 text-justify">
            <li>
              <strong>Google Sign-In:</strong> We offer Google Sign-In to make
              account creation and login faster. When you sign in with Google we
              receive basic profile information (name, email). For details see
              Google's privacy policy:{" "}
              <a
                className="text-fashion-accent-brown"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                policies.google.com/privacy
              </a>
              .
            </li>
            <li className="mt-3">
              <strong>Razorpay (Payments):</strong> We use Razorpay as our
              payment gateway for processing card and UPI payments. Payment data
              is processed by Razorpay — we never store your full card details
              on our servers. Razorpay's privacy information:{" "}
              <a
                className="text-fashion-accent-brown"
                href="https://razorpay.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                razorpay.com/privacy
              </a>
              .
            </li>
            <li className="mt-3">
              <strong>Delhivery (Shipping):</strong> For shipping and tracking
              we integrate with Delhivery. We share minimal shipment details
              (name, address, phone, order items) so your parcel can be
              delivered and tracked. Delhivery privacy:{" "}
              <a
                className="text-fashion-accent-brown"
                href="https://delhivery.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
              >
                delhivery.com/privacy
              </a>
              .
            </li>
            <li className="mt-3">
              <strong>Email & Transactional Messaging:</strong> We send order
              confirmations, verification emails, and notifications using
              server-side email services (configured via SMTP / Nodemailer).
              Depending on environment this may use providers such as Gmail or
              other SMTP-based services; those providers may process the email
              content to deliver messages.
            </li>
            {/* Advertising and large-scale third-party advertising partners are not used by default in this project. */}
          </ul>

          <p className="mb-4 text-2xl mt-4 text-justify">
            Hindi (संक्षेप): हम Google Sign-In का उपयोग करते हैं (नाम, ईमेल) —
            भुगतान के लिए Razorpay, शिपिंग के लिए Delhivery, और ईमेल भेजने के
            लिए SMTP/नोडमेलर आधारित सेवाएँ। हम आपके कार्ड की पूर्ण जानकारी अपने
            सर्वर पर संग्रहीत नहीं करते।
          </p>

          <h3 className="text-5xl font-medium mt-4 mb-2 text-center">
            Security
          </h3>
          <p className="mb-4 text-2xl mt-4 text-justify">
            We maintain best practices to protect your information, which
            include appropriate physical as well as electronic security
            measures. We use 128 bit Secure Socket Layer (SSL) technology to
            encrypt all of your private information when placing an order, which
            ensures that no one else can read this information.
          </p>

          <h3 className="text-5xl font-medium mt-4 mb-2 text-center">
            The Information We Don't Collect
          </h3>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Credit/Debit Card Information. This information goes directly to our
            third party, secure payment gateway and is not retained in our
            servers at all. Please refer to third party terms and condition.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
