import React, { useState } from "react";
import logo from "../../assets/images/logoblack.png";
import { Plus } from "lucide-react";

type QA = { question: string; answer: React.ReactNode };

const list: QA[] = [
  {
    question: "What is our return policy?",
    answer: (
      <div>
        <span className="block text-base sm:text-lg md:text-xl mb-3 text-justify">
          We do not have a refund policy. Refunds are only processed based on
          fulfilment errors, such as incorrectly shipped or missing items. The
          amount will be refunded via the original mode of payment within 10-15
          days of initiation.
        </span>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          We only accept returns and exchanges if there’s a size issue or
          damaged product. We only accept returns if there’s a damaged product
          (opening video mandatory). We accept exchanges if there’s a size and
          fit issue. In case the size is not available, we shall provide you a
          store credit valid for six months from the date of issue.
        </span>
      </div>
      ),
      },
  {
    question: "Condition Requirements",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        All items must be in their original condition; unworn, unused, unwashed,
        with the return tags still attached. All returns are accepted at the
        discretion of our team. Any item/s returned without their returns tag
        will not be accepted, and it is the customer’s responsibility to have
        their items collected from the warehouse.
      </span>
    ),
  },
  {
    question: "Shipping & Timelines (Returns)",
    answer: (
      <div>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          The return shipping cost is the responsibility of the customer; we do
          not refund the cost of shipping. Returns/Exchange must be initiated
          within 48 hours of the delivery date. The items must be returned to
          our warehouse before the return for credit or exchange can be issued.
          Flauntbynishi cannot be held liable for the loss of garments being
          returned.
        </span>
        <span className="block text-base sm:text-lg md:text-xl text-justify">
          Garments that have incurred any makeup stains or that smell of perfume
          or any other scent will not be accepted. Hence, please take care when
          trying on the garments. We do not accept any returns or exchanges for
          items marked as FINAL SALE.
        </span>
      </div>
    ),
  },
  {
    question: "Authorised Returns & Final Sale",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        Only authorised returns will be processed. Any returns sent without
        authorisation will be refused and it will be the responsibility of the
        customer to arrange collection of their garment. Please note, the above
        returns policy applies to all purchases made via the Flauntbynishi.com
        website only.
      </span>
    ),
  },
  {
    question: "How can I register a return / exchange?",
    answer: (
      <div>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          If your return meets our conditions outlined above, please follow the
          below steps to lodge your request:
        </span>
        <ol className="list-decimal list-inside text-base sm:text-lg md:text-xl space-y-2 mb-4">
          <li>
            Write an email to us at{" "}
            <a
              href="mailto:flauntbynishi@gmail.com"
              className="text-fashion-accent-brown"
            >
              flauntbynishi@gmail.com
            </a>{" "}
            describing the issue and attach photos.
          </li>
          <li>
            Once your request is approved, we request you to ship back the
            product to our warehouse within 72 hours of the delivery date.
          </li>
          <li>
            Once your return has been received at our warehouse, our returns
            team will process it within 3-5 business days. You will receive an
            email notification once your return has been processed.
          </li>
          <li>
            Please pack the garment in its original packaging with all the
            original tags as the courier agent will come to collect the package
            within 72 hours. Please note if we receive the items in any other
            packaging, we will not be able to accept the return and the package
            will be sent back.
          </li>
          <li>
            Remember that you must send the items you wish to return within 72
            hours from the delivery date of your order, before the exchange
            period expires. Items are eligible for exchange only once.
          </li>
        </ol>
      </div>
    ),
  },
  {
    question: "Processing Times",
    answer: (
      <div>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          When will my exchange be processed? Once we receive your return at our
          warehouse, please allow approximately 3-5 business days for your
          return to be assessed & processed by our team. We’ll send you an email
          notification once your exchange has been shipped. The entire exchange
          process can take up to 14 business days.
        </span>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          When will my return be processed? Returns may take up to 3 to 5
          business days from the date of delivery to be assessed and processed
          by us. Once your return has been processed, you will receive a
          notification via email with the store credit.
        </span>
        <span className="block text-base sm:text-lg md:text-xl text-justify">
          The credit amount for returns apply to the purchase price of the
          garments only. Please note that shipping charges are non-refundable.
          Return shipping charges are deducted from the credit amount. Store
          credit notes are valid for 6 months from the date of issue.
        </span>
      </div>
    ),
  },
  {
    question: "What if I received a faulty / incorrect item?",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        In the unlikely case that you do receive a faulty, damaged or incorrect
        item, please contact
        <a
          href="mailto:flauntbynishi@gmail.com"
          className="text-fashion-accent-brown"
        >
          flauntbynishi@gmail.com
        </a>
        with opening video and images of the garment so our team can assess
        further. Please include your order number and any images of the
        fault/incorrect item and we will work with you to resolve it as soon as
        possible.
      </span>
    ),
  },
  {
    question: "Can I return a sale item?",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        Items marked as SALE cannot be returned and are not eligible for store
        credit or exchange, unless the items are deemed faulty.
      </span>
    ),
  },
  {
    question: "Shipping & Delivery — Is there a shipping fee?",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        We offer free standard shipping for orders over INR 4,000 across India.
        A flat fee of INR 100 is charged on all orders below INR 4,000.
      </span>
    ),
  },
  {
    question: "Shipping & Delivery — What are the delivery timeframes?",
    answer: (
      <div>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          Orders are shipped within 1-2 business days of purchase. All orders
          are dispatched from our Surat, India warehouse. Please allow an
          additional 2-3 business days for dispatch during sale periods.
        </span>
        <span className="block text-base sm:text-lg md:text-xl mb-2 text-justify">
          Orders placed during weekends or public holidays will be processed
          within 24 hours on the next business day.
        </span>
        <span className="block text-base sm:text-lg md:text-xl text-justify">
          Once your order is shipped, your order will be delivered within 5-7
          business days.
        </span>
      </div>
    ),
  },
  {
    question: "Shipping & Delivery — How to track my order?",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        You can track your order via your shipping confirmation email or by
        logging into your Flauntbynishi account. Please note that it may take 24
        hours for tracking updates to appear. If you do not receive your
        tracking details, please contact the team directly at
        <a
          href="mailto:flauntbynishi@gmail.com"
          className="text-fashion-accent-brown"
        >
          flauntbynishi@gmail.com
        </a>
        .
      </span>
    ),
  },
  {
    question:
      "Shipping & Delivery — Can I update my shipping address after placing an order?",
    answer: (
      <span className="block text-base sm:text-lg md:text-xl text-justify">
        Shipping addresses cannot be changed after an order has been placed. To
        avoid any issues, we recommend reviewing your address carefully before
        confirming your order. Flauntbynishi cannot be held responsible for
        orders shipped to an incorrect address provided at checkout.
      </span>
    ),
  },
];

const ReturnPolicy: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl shadow-sm p-8 sm:p-12">
          
          <span className="block text-2xl sm:text-3xl md:text-5xl font-semibold text-[#95522C] mb-12 text-center">
            Return & Exchange Policy
          </span>

          <div className="max-w-3xl mx-auto">
            {list.map((qa, i) => (
              <div key={i} className="border-b border-gray-100">
                <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      aria-expanded={openIndex === i}
                      aria-controls={`qa-${i}`}
                      className="w-full flex items-center justify-between py-4 text-left"
                    >
                  <span className="block text-base sm:text-lg md:text-xl font-medium text-fashion-accent-brown">
                    {qa.question}
                  </span>
                  <Plus
                    className={`w-5 h-5 transform transition-transform ${
                      openIndex === i ? "rotate-45" : ""
                    }`}
                  />
                </button>
                    <div
                      id={`qa-${i}`}
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

export default ReturnPolicy;
