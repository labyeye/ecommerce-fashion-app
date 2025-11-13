import React from "react";
import logo from "../../assets/images/logoblack.png";
const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background rounded-xl p-8 sm:p-12">
          <img
            src={logo}
            alt="Terms and Conditions"
            className="w-48 h-48 mx-auto rounded-lg"
          />
          <h3 className="text-5xl font-semibold text-[#95522C] mb-12 text-center">
            Terms and Conditions
          </h3>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Welcome to FlauntbyNishi web site (“the Site,” “we,” “us,” or
            “our”). By using this site, you agree to follow and be bound by the
            following terms below. Additionally, FlauntbyNishi reserves the
            right to modify these terms at any time without prior notification.
            Site users must agree upon and abide by these changes accordingly.
            Please review this page periodically for changes. Any use of our
            Site at any time constitutes full acceptance of our service terms.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Description of Service
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            FlauntbyNishi is a e-retailer of designer-quality goods offered at
            great values to the consumer. Membership allows customers to
            purchase our designs and products.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Usage Restrictions
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            All of the content that appears on FlauntbyNishi web site, including
            all visuals, text, audio and video clips are subject to copyright
            protections and /or other intellectual property rights or licenses
            held by the Site. Content of the website is intended solely for the
            personal, non-commercial use by the users of our Site.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Membership Eligibility
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            Membership for FlauntbyNishi is free. However, our membership
            services are not available to users under the age of 18 or to
            members who, at our discretion, have been suspended or removed from
            the Site systems. Members agree to all terms of service and must
            only apply for membership if eligible.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Notice
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            FlauntbyNishi may contact you or provide you with service-related
            and/ or promotional notices by means of postal mail, electronic
            mail, general site notifications and more using the contact
            information you have provided to us.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Pricing Policy
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            At FlauntbyNishi, we are committed to providing our customers with
            great quality products at affordable prices. Our products are sold
            online. We have done our best to display our items as accurately as
            possible on the Site. Please be aware, variations in style, color,
            size, shape and look may occur. If you are not satisfied with your
            purchase, please review our Returns &amp; Exchanges section for
            further assistance.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Site Use
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            You cannot access or use FlauntbyNishi website for any illegal or
            unauthorized purpose. Also, you agree that no comments or other user
            submissions submitted by you to the FlauntbyNishi website will
            violate any right of any third party, including copyright,
            trademark, privacy or other personal rights. You are and shall
            remain solely responsible for the content of any comments you make.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Indemnity
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            By use of this Site, you agree to indemnify and hold FlauntbyNishi
            (and its officers, directors, agents, subsidiaries, joint ventures,
            and employees) harmless from any claim or demand, as well as losses,
            expenses, damages and costs, resulting from any violation of these
            terms of service or any activity related to your account.
          </p>

          <span className="text-5xl font-medium text-[#95522C] mt-6 mb-3">
            • Third Party Links
          </span>
          <p className="mb-4 text-2xl mt-4 text-justify">
            To improve our Site, FlauntbyNishi may use and promote services
            provided by outside third parties. However, even if the third party
            is affiliated with the Site, we do not control these services and
            make no representations regarding these persons or entities. We are
            not liable or responsible for the accuracy, completeness,
            timeliness, reliability or availability of, any such parties.
            Outside sites linked on our Site, all of which have separate privacy
            and data collection practices, are only for your convenience and
            therefore you access them at your own risk.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
