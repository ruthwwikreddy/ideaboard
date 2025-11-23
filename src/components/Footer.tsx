import { Wand, Twitter, Github, Linkedin } from "lucide-react";
import { NavLink } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <Wand className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">DevPlan AI</h1>
            </div>
            <p className="text-muted-foreground mt-4">
              From concept to code, instantly.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-3">
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink to="/about-us" className="text-muted-foreground hover:text-primary">
                    About Us
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/blog" className="text-muted-foreground hover:text-primary">
                    Blog
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/faq" className="text-muted-foreground hover:text-primary">
                    FAQ
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact-us" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <NavLink to="/privacy-policy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/terms-and-conditions" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/cancellations-and-refunds" className="text-muted-foreground hover:text-primary">
                    Cancellations and Refunds
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Social</h3>
              <div className="flex items-center gap-4">
                <a
                  href="https://twitter.com/devplan_ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Twitter className="w-6 h-6" />
                </a>
                <a
                  href="https://github.com/devplan-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="https://linkedin.com/company/devplan-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} DevPlan AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;