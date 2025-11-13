import React, { useState } from "react";
import logo from "../../assets/images/logoblack.png";
import { Plus } from "lucide-react";

type QA = { question: string; answer: React.ReactNode };

const faqList: QA[] = [
  {
    question: "How do I care for my garments?",
    answer: (
      <div>
        <p className="mb-2 text-2xl">
          Please read the wash care label in your garment to care for your
          Flauntbynishi pieces and extend its longevity.
        </p>
        <ul className="list-disc list-inside text-xl space-y-2">
          <li>
            <strong>Dry Clean Only:</strong> Garments with this care tag need to
            be professionally dry-cleaned. The process involves a cleaning
            method using a solvent other than water.
          </li>
          <li>
            <strong>Hand wash:</strong> These garments must be washed by hand
            and cannot be put in the washer. Please do not wring or twist as
            this can distort the shape of the garment. Reshape and lay flat to
            air dry.
          </li>
          <li>
            <strong>Wash Cold:</strong> Select cold water on a gentle setting on
            your washer. These garments should be laid flat to air dry.
          </li>
        </ul>
      </div>
    ),
  },
  {
    question: "What size am I?",
    answer: (
      <div>
        <p className="mb-2 text-2xl">
          Product measurements of each style can be found on each product page.
          All of our garments are measured in inches and are of the garment laid
          flat. For general information on product sizing and size conversion,
          read our size and fit guide.
        </p>
        <p className="text-2xl">
          If you would like further advice on sizing, please contact our team at{" "}
          <a
            href="mailto:flauntbynishi@gmail.com"
            className="text-fashion-accent-brown"
          >
            flauntbynishi@gmail.com
          </a>
          .
        </p>
      </div>
    ),
  },
  {
    question: "Do you have COD?",
    answer: (
      <p className="text-2xl">
        We only offer partial COD — customer needs to pay INR 500
        (non-refundable) online and the rest on delivery. Flat Shipping of INR
        100 on all COD orders.
      </p>
    ),
  },
  {
    question: "I was debited but not sure if my order went through.",
    answer: (
      <p className="text-2xl">
        If the order was placed, you should have received an order confirmation
        email. Check spam/junk folders. If you haven’t received it, email{" "}
        <a
          href="mailto:flauntbynishi@gmail.com"
          className="text-fashion-accent-brown"
        >
          flauntbynishi@gmail.com
        </a>{" "}
        and we will check immediately.
      </p>
    ),
  },
  {
    question: "I’m unable to make the payment to complete my purchase.",
    answer: (
      <p className="text-2xl">
        This may happen due to technical reasons. Please try again. If the issue
        persists, email{" "}
        <a
          href="mailto:flauntbynishi@gmail.com"
          className="text-fashion-accent-brown"
        >
          flauntbynishi@gmail.com
        </a>{" "}
        with the items, sizes and your pincode — we'll send a payment link.
      </p>
    ),
  },
  {
    question: "Do you have a store?",
    answer: (
      <p className="text-2xl">
        We’re an online brand and sell primarily through our website. We do not
        have a retail space at this time.
      </p>
    ),
  },
  {
    question: "Where are you based?",
    answer: <p className="text-2xl">Our studio is based in Surat, Gujarat.</p>,
  },
  {
    question: "What are your work timings?",
    answer: (
      <p className="text-2xl">
        Our web shop is open 24/7. Studio hours are Monday - Friday, 10:30 am to
        6 pm.
      </p>
    ),
  },
  {
    question: "I sent an email but received no response.",
    answer: (
      <p className="text-2xl">
        Our usual response time is 24 hours. If you haven’t heard back in 2
        working days, please send a polite reminder to{" "}
        <a
          href="mailto:flauntbynishi@gmail.com"
          className="text-fashion-accent-brown"
        >
          flauntbynishi@gmail.com
        </a>
        .
      </p>
    ),
  },
  {
    question: "Press, Media & Collaboration",
    answer: (
      <p className="text-2xl">
        For press, media or collaboration queries please write to{" "}
        <a
          href="mailto:flauntbynishi@gmail.com"
          className="text-fashion-accent-brown"
        >
          flauntbynishi@gmail.com
        </a>
        .
      </p>
    ),
  },
  {
    question: "Brand listing / Wholesale / Jobs & Internships",
    answer: (
      <div>
        <p className="text-2xl mb-2">
          For brand listing or wholesale enquiries, email your proposal to{" "}
          <a
            href="mailto:flauntbynishi@gmail.com"
            className="text-fashion-accent-brown"
          >
            flauntbynishi@gmail.com
          </a>
          .
        </p>
        <p className="text-2xl">
          For jobs & internships, send your resume and portfolio to the same
          address. We will respond if there's a suitable opening.
        </p>
      </div>
    ),
  },
];

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-fashion-cream py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-fashion-cream rounded-xl shadow-sm p-8 sm:p-12">
          <img
            src={logo}
            alt="Flaunt by Nishi"
            className="w-48 h-48 mx-auto rounded-lg"
          />
          <h3 className="text-5xl font-semibold text-[#95522C] mb-12 text-center">
            Frequently Asked Questions
          </h3>

          <div className="max-w-3xl mx-auto py-10">
            {faqList.map((qa, i) => (
              <div key={i} className="border-b border-gray-100">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <span className="text-2xl font-medium text-fashion-accent-brown">
                    {qa.question}
                  </span>
                  <Plus
                    className={`w-5 h-5 transform transition-transform ${
                      openIndex === i ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === i ? "max-h-screen py-4" : "max-h-0"
                  }`}
                >
                  <div className="px-2">{qa.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
