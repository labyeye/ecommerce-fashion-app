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
            Like almost all e-commerce web sites, we use cookies. Our cookies
            don't store any of your personal information, but they do allow us
            to do things like keep items in your shopping cart during your visit
            or provide you with a more personalized user experience. We may use
            selected third parties for marketing and analysis purposes. This
            anonymous information is collected through the use of a pixel tag,
            which is industry standard technology used by most major web sites.
            We feel that the use of 3rd party services such as mentioned above,
            this improve your online experience, because they allow you to see
            ads that will be more likely to be something you are interested in.
            If you want to opt-out from some cookies or tags that we collect,
            please visit these pages for more information:
          </p>
          <ul className="list-disc list-inside mb-4 text-2xl mt-4 text-justify">
            <li>
              <a
                className="text-fashion-accent-brown"
                href="https://www.google.com/ads/preferences"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.google.com/ads/preferences
              </a>
            </li>
            <li>
              <a
                className="text-fashion-accent-brown"
                href="https://www.adroll.com/about/privacy#optpolicy"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.adroll.com/about/privacy#optpolicy
              </a>
            </li>
            <li>
              <a
                className="text-fashion-accent-brown"
                href="https://www.networkadvertising.org/choices"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.networkadvertising.org/choices
              </a>
            </li>
          </ul>

          <h3 className="text-5xl font-medium mt-4 mb-2 text-center">Security</h3>
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
