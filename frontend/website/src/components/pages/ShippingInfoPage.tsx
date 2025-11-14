import React from "react";
import logo from "../../assets/images/logoblack.png";

const ShippingInfoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-8 sm:p-12">
          <img
            src={logo}
            alt="Shipping"
            className="w-36 h-36 mx-auto rounded-md"
          />

          <h3 className="text-4xl font-semibold text-[#95522C] mb-6 text-center">
            Shipping Information
          </h3>

          <div className="flex flex-col items-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Delhivery_Logo_%282019%29.png" alt="Delhivery" className="w-40 h-auto mb-4" />
            <p className="mb-4 text-lg text-justify max-w-3xl mt-10">
              We partner with Delhivery to fulfil and deliver orders across India.
              When you place an order, we share only the minimum shipment
              information required to deliver your parcel: recipient name,
              delivery address, phone number and basic order item details. This
              information is used only for shipment creation, pickup and
              tracking.
            </p>
          </div>

          <h6 className="text-2xl font-medium text-[#95522C] mt-6 mb-3">Delivery Times</h6>
          <p className="mb-4 text-lg text-justify">
            Typical delivery times vary depending on your location and the
            items in your order. Standard delivery is usually 3–7 business
            days from dispatch. For remote locations it may take longer. If a
            product is out of stock or requires additional processing time we
            will inform you via email or SMS.
          </p>

          <h6 className="text-2xl font-medium text-[#95522C] mt-6 mb-3">Tracking</h6>
          <p className="mb-4 text-lg text-justify">
            After your order ships we will provide a tracking number. You can
            track your parcel on Delhivery's website or using the tracking URL
            provided in your order confirmation email.
          </p>

          <h6 className="text-2xl font-medium text-[#95522C] mt-6 mb-3">Shipping Charges</h6>
          <p className="mb-4 text-lg text-justify">
            Shipping charges (if applicable) are calculated at checkout based
            on weight, dimensions, and delivery location. Any taxes or duties
            for international orders (if applicable) are the responsibility of
            the recipient.
          </p>

          <h6 className="text-2xl font-medium text-[#95522C] mt-6 mb-3">Returns and Failed Deliveries</h6>
          <p className="mb-4 text-lg text-justify">
            If a delivery fails due to incorrect address or if you do not take
            delivery, the parcel may be returned to us. For returns and
            refund-related questions please visit our Return Policy page or
            contact our support team via the Contact page.
          </p>

          <h6 className="text-2xl font-medium text-[#95522C] mt-6 mb-3">Privacy and Data</h6>
          <p className="mb-4 text-lg text-justify">
            Delhivery processes shipment-related information as a logistics
            partner. For details on how Delhivery handles personal data, see
            their privacy policy: <a className="text-fashion-accent-brown" href="https://delhivery.com/privacy/" target="_blank" rel="noopener noreferrer">delhivery.com/privacy</a>.
          </p>
          <div className="mt-8 text-center">
            <a href="/contact" className="inline-block px-6 py-3 bg-[#95522C] text-white rounded-md">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfoPage;
