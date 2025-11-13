import React from "react";
import logo from "../../assets/images/logoblack.png";

const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-8 sm:p-12">
          <img
            src={logo}
            alt="Return Policy"
            className="w-48 h-48 mx-auto rounded-lg"
          />

          <h3 className="text-5xl font-semibold text-[#95522C] mb-8 text-center">
            Return & Exchange Policy
          </h3>

          <p className="mb-4 text-2xl mt-4 text-justify">
            We do not have a refund policy. Refunds are only processed based on
            fulfilment errors, such as incorrectly shipped or missing items. The
            amount will be refunded via the original mode of payment within
            10-15 days of initiation.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Returns & Exchanges — Overview
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            We only accept returns and exchanges if there’s a size issue or a
            damaged product. Returns are accepted only for damaged products (an
            opening video is mandatory). We accept exchanges for size and fit
            issues. If the requested size is not available, we will issue a
            store credit valid for six months from the date of issue.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Condition Requirements
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            All items must be in their original condition: unworn, unused,
            unwashed, with the return tags still attached. All returns are
            accepted at the discretion of our team. Any item(s) returned without
            their returns tag will not be accepted, and it is the customer’s
            responsibility to have their items collected from the warehouse.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Shipping and Timelines
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            The return shipping cost is the responsibility of the customer; we
            do not refund the cost of shipping. Returns/Exchanges must be
            initiated within 48 hours of the delivery date. The items must be
            returned to our warehouse before the return for credit or exchange
            can be issued. Flauntbynishi cannot be held liable for the loss of
            garments being returned.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Hygiene & Final Sale
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Garments that have incurred any makeup stains or that smell of
            perfume or any other scent will not be accepted. Please take care
            when trying on the garments. We do not accept any returns or
            exchanges for items marked as FINAL SALE.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Authorised Returns Only
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Only authorised returns will be processed. Any returns sent without
            authorisation will be refused and it will be the responsibility of
            the customer to arrange collection of their garment. Please note,
            the above returns policy applies to all purchases made via the
            Flauntbynishi.com website only.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • How to Register a Return / Exchange
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            If your return meets our conditions outlined above, please follow
            the steps below to lodge your request:
          </p>
          <ol className="list-decimal list-inside mb-4 text-2xl mt-4 text-justify">
            <li className="mb-2">
              Write an email to us at flauntbynishi@gmail.com describing the
              issue and attach photos.
            </li>
            <li className="mb-2">
              Once your request is approved, ship back the product to our
              warehouse within 72 hours of the delivery date.
            </li>
            <li className="mb-2">
              Once the return has been received at our warehouse, our returns
              team will process it within 3-5 business days. You will receive an
              email notification once your return has been processed.
            </li>
            <li className="mb-2">
              Please pack the garment in its original packaging with all
              original tags; courier will collect within 72 hours. If we receive
              items in other packaging, we may not accept the return and the
              package will be sent back.
            </li>
            <li className="mb-2">
              Items must be sent within 72 hours from the delivery date, before
              the exchange period expires. Items are eligible for exchange only
              once.
            </li>
          </ol>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Processing Times
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            When will my exchange be processed? Once we receive your return at
            our warehouse, please allow approximately 3-5 business days for
            assessment & processing. We’ll send you an email notification once
            your exchange has been shipped. The entire exchange process can take
            up to 14 business days.
          </p>
          <p className="mb-4 text-2xl mt-4 text-justify">
            When will my return be processed? Returns may take up to 3-5
            business days from the date of delivery to be assessed and processed
            by us. Once processed, you will receive an email notification with
            the store credit. The credit amount applies to the purchase price
            only. Shipping charges are non-refundable and return shipping
            charges are deducted from the credit amount. Store credit notes are
            valid for 6 months from the date of issue.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Faulty / Incorrect Items
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            If you receive a faulty, damaged or incorrect item, please contact
            flauntbynishi@gmail.com with an opening video and images of the
            garment so our team can assess further. Include your order number
            and any images of the fault/incorrect item and we will work with you
            to resolve it as soon as possible.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Sale Items
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Items marked as SALE cannot be returned and are not eligible for
            store credit or exchange, unless the items are deemed faulty.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
