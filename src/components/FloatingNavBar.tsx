import React from "react";
import { NavLink } from "./NavLink";

/**
 * Translucent floating curved navigation bar.
 * This component is intended to be used only on the homepage (Index page).
 */
export const FloatingNavBar: React.FC = () => {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl bg-background/60 backdrop-blur-md rounded-full flex items-center justify-center gap-6 py-2 px-6 shadow-lg z-50">
      <NavLink to="/" className="text-foreground hover:text-primary transition-colors" activeClassName="font-bold text-primary">
        Home
      </NavLink>
      <NavLink to="/about-us" className="text-foreground hover:text-primary transition-colors" activeClassName="font-bold text-primary">
        About
      </NavLink>
      <NavLink to="/features" className="text-foreground hover:text-primary transition-colors" activeClassName="font-bold text-primary">
        Features
      </NavLink>
      <NavLink to="/contact-us" className="text-foreground hover:text-primary transition-colors" activeClassName="font-bold text-primary">
        Contact
      </NavLink>
    </nav>
  );
};
