import React from "react";
const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-8 sm:p-12">
          <span className="block text-5xl sm:text-3xl md:text-5xl font-semibold text-[#95522C] mb-6 text-center">
            Privacy Policy
          </span>

          <section className="mb-6">
            <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
              We firmly believe in your privacy and the security of your
              personal information. We do not rent, sell or distribute our
              customer base or newsletter e-mails to anyone. We also do not
              store your credit card details on our server; all credit card
              purchases are processed through our secure payment gateway. Your
              privacy is important to us.
            </span>
          </section>

          <span className="block text-2xl sm:text-xl md:text-4xl font-semibold text-tertiary mt-6 mb-4">
            The Information We Collect
          </span>

          <section className="mb-4">
            <span className="block text-2xl sm:text-xl md:text-4xl font-semibold mt-4 mb-2">
              • Your e-mail:
            </span>
            <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
              You don't like spam. We don't like spam. Because of this, we only
              send our newsletter to email addresses that have opted in, and
              they may opt out at any time. If you place an order with us, we
              send email messages pertaining to your order. We do not sell your
              email address to other parties.
            </span>

            <span className="block text-2xl sm:text-xl md:text-4xl font-semibold mt-4 mb-2">
              • Your Personal Information:
            </span>
            <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
              We collect your personal information when you provide it to us as
              you place your order, including your name, shipping and billing
              address, credit card number, mobile number and email address. We
              use this information to process your order, provide you with
              support, and update you on your order. We do not sell your
              personal information to other parties.
            </span>

            <span className="block text-2xl sm:text-xl md:text-4xl font-semibold mt-4 mb-2">
              • Anonymous Information:
            </span>
            <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
              We collect non-personal information from you, including your
              browser type, the URL of the previous web site you visited, your
              ISP, operating system, etc. This information is anonymous and is
              collected by almost all sites that you visit. We use this
              information, which does not identify individual users, to analyse
              trends, to administer the site, to track users' movements around
              the site and gather demographic information about our user base as
              a whole.
            </span>

            <span className="block text-2xl sm:text-xl md:text-4xl font-semibold mt-4 mb-2">
              • Cookies:
            </span>
            <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
              Like almost all e-commerce web sites, we use cookies. Our cookies
              don't store any of your personal information, but they do allow us
              to do things like keep items in your shopping cart during your
              visit or provide you with a more personalized user experience. We
              may use selected third parties for marketing and analysis
              purposes. This anonymous information is collected through the use
              of a pixel tag, which is industry standard technology used by most
              major web sites. We feel that the use of 3rd party services as
              mentioned above improves your online experience because they allow
              you to see ads that are more likely to be relevant. If you want to
              opt-out from some cookies or tags that we collect, please visit
              these pages for more information:
            </span>

            <ul className="list-disc list-inside mb-4 text-2xl sm:text-lg md:text-xl mt-2">
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
              <li className="mt-2">
                <a
                  className="text-fashion-accent-brown"
                  href="https://www.adroll.com/about/privacy#optpolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.adroll.com/about/privacy#optpolicy
                </a>
              </li>
              <li className="mt-2">
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
          </section>

          {/* removed duplicate 'What We Use' block; third-party links included in Cookies section */}

          <span className="block text-2xl sm:text-xl md:text-4xl font-semibold mt-4 mb-2">
            Security
          </span>
          <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
            We maintain best practices to protect your information, which
            include appropriate physical as well as electronic security
            measures. We use 128 bit Secure Socket Layer (SSL) technology to
            encrypt all of your private information when placing an order, which
            ensures that no one else can read this information.
          </span>

          <span className="block text-2xl sm:text-xl md:text-4xl font-semibold mt-4 mb-2">
            The Information We Don't Collect
          </span>
          <span className="block mb-4 text-2xl sm:text-lg md:text-2xl text-justify">
            Credit/Debit Card Information. This information goes directly to our
            third party, secure payment gateway and is not retained in our
            servers at all. Please refer to third party terms and conditions.
          </span>

          <span className="block mt-2 mb-1 text-2xl sm:text-lg md:text-xl">
            Razorpay:
          </span>
          <span className="block mt-1 mb-3 text-2xl sm:text-lg md:text-xl">
            Delhivery:
          </span>
          <span className="block mt-1 mb-3 text-2xl sm:text-lg md:text-xl">
            Google Sign in:
          </span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
