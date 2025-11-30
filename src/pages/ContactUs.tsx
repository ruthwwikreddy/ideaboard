import React from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, Clock, MessageSquare } from "lucide-react";
import BackToHome from "@/components/BackToHome";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    value: "akkenapally.reddy@gmail.com",
    description: "Send us an email anytime",
    href: "mailto:akkenapally.reddy@gmail.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 7842906633",
    description: "Mon-Fri, 9 AM - 5 PM IST",
    href: "tel:+917842906633",
  },
];

const ContactUs = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - IdeaBoard AI</title>
        <meta name="description" content="Get in touch with the IdeaBoard AI team for support, feedback, or any questions." />
        <link rel="canonical" href="https://www.ideaboard.ai/contact-us" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ideaboard.ai/contact-us" />
        <meta property="og:title" content="Contact Us - IdeaBoard AI" />
        <meta property="og:description" content="Get in touch with the IdeaBoard AI team for support, feedback, or any questions." />
        <meta property="og:image" content="https://www.ideaboard.ai/logo.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.ideaboard.ai/contact-us" />
        <meta property="twitter:title" content="Contact Us - IdeaBoard AI" />
        <meta property="twitter:description" content="Get in touch with the IdeaBoard AI team for support, feedback, or any questions." />
        <meta property="twitter:image" content="https://www.ideaboard.ai/logo.png" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <BackToHome />

          {/* Hero Section */}
          <header className="text-center mb-16 mt-8">
            <div className="inline-block mb-6">
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-purple-500 rounded-full mx-auto"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
              Get in Touch
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Have questions, feedback, or need support? We'd love to hear from you.
              Our team is here to help you succeed.
            </p>
          </header>

          {/* Contact Methods */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <a
                    key={index}
                    href={method.href}
                    className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                      <p className="text-primary font-medium mb-1">{method.value}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Availability Info */}
          <section className="mb-16">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Support Hours</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our support team is available <strong>Monday to Friday, 9:00 AM - 5:00 PM (IST)</strong>.
                    We typically respond to all inquiries within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Prompt */}
          <section className="text-center bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-3xl p-12 border border-primary/20 max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Looking for Quick Answers?</h2>
            <p className="text-muted-foreground mb-6">
              Check out our documentation and FAQ section for instant answers to common questions.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Visit Dashboard
            </a>
          </section>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
