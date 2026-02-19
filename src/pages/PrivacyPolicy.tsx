import React from "react";
import { Helmet } from "react-helmet-async";
import BackToHome from "@/components/BackToHome";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Privacy Policy - IdeaBoard AI</title>
        <meta name="description" content="Read the IdeaBoard AI privacy policy to understand how we collect, use, and protect your personal information and data." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ideaboard.live/privacy-policy" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ideaboard.live/privacy-policy" />
        <meta property="og:title" content="Privacy Policy - IdeaBoard AI" />
        <meta property="og:description" content="Read the IdeaBoard AI privacy policy to understand how we collect, use, and protect your personal information and data." />
        <meta property="og:image" content="https://ideaboard.live/logo.png" />
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://ideaboard.live/privacy-policy" />
        <meta property="twitter:title" content="Privacy Policy - IdeaBoard AI" />
        <meta property="twitter:description" content="Read the IdeaBoard AI privacy policy to understand how we collect, use, and protect your personal information and data." />
        <meta property="twitter:image" content="https://ideaboard.live/logo.png" />
      </Helmet>
      <BackToHome />
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-lg mb-4">
        This Privacy Policy describes how IdeaBoard AI ("we," "us," or "our") collects, uses, and discloses your information when you use our service, ideaboard.ai (the "Service").
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">1. Information We Collect</h2>
      <p className="mb-4">
        We collect several types of information from and about users of our Service, including:
        <ul className="list-disc list-inside ml-4">
          <li><strong>Personal Information:</strong> Information by which you may be personally identified, such as name, email address, and payment information.</li>
          <li><strong>Usage Data:</strong> Information about how you access and use the Service, such as your IP address, browser type, operating system, and the pages you visit.</li>
          <li><strong>Idea Data:</strong> The app ideas you submit for analysis. We process this data to provide our service.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">2. How We Use Your Information</h2>
      <p className="mb-4">
        We use information that we collect about you or that you provide to us, including any personal information:
        <ul className="list-disc list-inside ml-4">
          <li>To provide, operate, and maintain our Service.</li>
          <li>To improve, personalize, and expand our Service.</li>
          <li>To understand and analyze how you use our Service.</li>
          <li>To develop new products, services, features, and functionality.</li>
          <li>To process your transactions and manage your subscriptions.</li>
          <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes.</li>
          <li>To find and prevent fraud.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">3. Disclosure of Your Information</h2>
      <p className="mb-4">
        We may disclose aggregated information about our users, and information that does not identify any individual, without restriction. We may disclose personal information that we collect or you provide:
        <ul className="list-disc list-inside ml-4">
          <li>To our subsidiaries and affiliates.</li>
          <li>To contractors, service providers, and other third parties we use to support our business (e.g., payment processors, analytics providers).</li>
          <li>To fulfill the purpose for which you provide it.</li>
          <li>For any other purpose disclosed by us when you provide the information.</li>
          <li>With your consent.</li>
          <li>To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">4. Data Security</h2>
      <p className="mb-4">
        We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. However, the safety and security of your information also depends on you.
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">5. Your Data Protection Rights</h2>
      <p className="mb-4">
        Depending on your location, you may have the following data protection rights:
        <ul className="list-disc list-inside ml-4">
          <li>The right to access, update or to delete the information we have on you.</li>
          <li>The right to object to our processing of your Personal Data.</li>
          <li>The right to request that we restrict the processing of your personal information.</li>
          <li>The right to data portability.</li>
          <li>The right to withdraw consent.</li>
        </ul>
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">6. Changes to Our Privacy Policy</h2>
      <p className="mb-4">
        It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the Website home page.
      </p>

      <h2 className="text-2xl font-semibold mb-4 mt-8">7. Contact Information</h2>
      <p className="mb-4">
        To ask questions or comment about this privacy policy and our privacy practices, contact us at: support@ideaboard.ai.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
