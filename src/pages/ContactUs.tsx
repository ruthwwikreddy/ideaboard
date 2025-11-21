import React from "react";
import { Helmet } from "react-helmet-async";

const ContactUs = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <Helmet>
        <title>Contact Us - IdeaBoard AI</title>
        <meta name="description" content="Get in touch with the IdeaBoard AI team for support, feedback, or any questions." />
      </Helmet>
      <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
      <p className="text-lg mb-4">
        We'd love to hear from you! Please reach out to us with any questions, feedback, or support requests.
      </p>
      <div className="space-y-4">
        <p><strong>Email:</strong> akkenapally.reddy@gmail.com</p>
        <p><strong>Phone:</strong> 7842906633</p>

      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Our support team is available Monday to Friday, 9 AM - 5 PM (EST).
      </p>
    </div>
  );
};

export default ContactUs;
