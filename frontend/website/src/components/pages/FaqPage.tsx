import React from "react";
import logo from "../../assets/images/logoblack.png";

const FaqPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-8 sm:p-12">
          <img
            src={logo}
            alt="Flaunt by Nishi"
            className="w-48 h-48 mx-auto rounded-lg"
          />
          <h3 className="text-5xl font-semibold text-[#95522C] mb-12 text-center">
            Frequently Asked Questions
          </h3>

          <section className="mb-10">
            <span className="text-5xl font-medium text-[#95522C] mb-8">
              Products — Care
            </span>
            <p className="mb-2 mt-5 text-2xl text-justify">
              Please read the wash care label in your garment to care for your
              Flauntbynishi pieces and extend its longevity.
            </p>
            <ul className="list-disc list-inside mb-4 text-2xl">
              <li className="mb-2">
                <strong>Dry Clean Only:</strong> Garments with this tag need
                professional dry cleaning using a solvent other than water.
              </li>
              <li className="mb-2">
                <strong>Hand Wash:</strong> Handwash only — do not wring or
                twist. Reshape and lay flat to air dry.
              </li>
              <li className="mb-2">
                <strong>Wash Cold:</strong> Use cold water on a gentle setting
                and lay flat to air dry.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <span className="text-5xl font-medium text-[#95522C] mb-8">
              Sizing
            </span>
            <p className="mb-2 mt-5 text-2xl text-justify">
              Product measurements of each style are available on each product
              page. All garments are measured in inches, laid flat. For general
              sizing and conversions, see our Size &amp; Fit guide on the
              product page. If you need personalised advice, contact us at{" "}
              <a
                href="mailto:flauntbynishi@gmail.com"
                className="text-fashion-accent-brown"
              >
                flauntbynishi@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mb-10">
            <span className="text-5xl font-medium text-[#95522C] mb-8">
              Payment
            </span>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Cash on Delivery (COD):</strong> We offer partial COD —
              customers pay INR 500 (non-refundable) online and the remainder on
              delivery. A flat shipping fee of INR 100 applies to COD orders.
            </p>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Debited but no confirmation:</strong> If you were charged
              but didn't receive an order confirmation email, check spam
              folders. If still missing, email{" "}
              <a
                href="mailto:flauntbynishi@gmail.com"
                className="text-fashion-accent-brown"
              >
                flauntbynishi@gmail.com
              </a>{" "}
              so we can investigate.
            </p>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Payment failures:</strong> If payments fail due to
              technical issues, try again. Persisting problems? Email us the
              items, sizes and your pincode and we'll send a payment link.
            </p>
          </section>

          <section className="mb-10">
            <span className="text-5xl font-medium text-[#95522C] mb-8">
              Contact &amp; Support
            </span>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Online store:</strong> We are an online-first brand and do
              not have a retail space currently. Our studio is based in Surat,
              Gujarat. Webshop is open 24/7; studio hours are Monday–Friday,
              10:30am–6pm.
            </p>
            <p className="mb-2 mt-5 text-2xl text-justify">
              If you haven't heard back within 2 working days, please send a
              polite reminder to{" "}
              <a
                href="mailto:flauntbynishi@gmail.com"
                className="text-fashion-accent-brown"
              >
                flauntbynishi@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mb-10">
            <span className="text-5xl font-medium text-[#95522C] mb-8">
              Collaborations, Hiring &amp; Wholesale
            </span>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Press &amp; Media:</strong> Contact{" "}
              <a
                href="mailto:flauntbynishi@gmail.com"
                className="text-fashion-accent-brown"
              >
                flauntbynishi@gmail.com
              </a>
              .
            </p>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Brand Listing / Wholesale:</strong> Email your proposal to{" "}
              <a
                href="mailto:flauntbynishi@gmail.com"
                className="text-fashion-accent-brown"
              >
                flauntbynishi@gmail.com
              </a>
              .
            </p>
            <p className="mb-2 mt-5 text-2xl text-justify">
              <strong>Jobs &amp; Internships:</strong> Email your resume and
              portfolio to{" "}
              <a
                href="mailto:flauntbynishi@gmail.com"
                className="text-fashion-accent-brown"
              >
                flauntbynishi@gmail.com
              </a>
              . We'll respond if there's a suitable opening.
            </p>
          </section>

          <section className="mb-10">
            <span className="text-5xl font-medium text-[#95522C] mb-8">
              Privacy &amp; Data
            </span>
            <p className="mb-2 mt-5 text-2xl text-justify">
              We care about your privacy. For details on how we collect and use
              information (emails, personal info, anonymous analytics, cookies
              and security) please read our{" "}
              <a href="/privacy" className="text-fashion-accent-brown">
                Privacy Policy
              </a>
              . Key points:
            </p>
            <ul className="list-disc list-inside mb-4 text-2xl">
              <li className="mb-2">
                We only send newsletters to opted-in email addresses and you may
                opt-out at any time.
              </li>
              <li className="mb-2">
                We do not sell personal data or email addresses to third
                parties.
              </li>
              <li className="mb-2">
                Credit/debit card details are processed by secure third-party
                gateways and are not stored on our servers.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
