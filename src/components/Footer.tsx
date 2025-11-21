import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-12 py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} IdeaBoard AI. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to="/contact-us" className="hover:text-primary transition-colors">
            Contact Us
          </Link>
          <Link to="/terms-and-conditions" className="hover:text-primary transition-colors">
            Terms and Conditions
          </Link>
          <Link to="/cancellations-and-refunds" className="hover:text-primary transition-colors">
            Cancellations and Refunds
          </Link>
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
