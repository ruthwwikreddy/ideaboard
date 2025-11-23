import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is DevPlan AI?",
    answer:
      "DevPlan AI is an AI-powered platform that helps you validate your startup ideas, conduct market research, analyze competitors, and generate a comprehensive build plan for your app.",
  },
  {
    question: "Who is this for?",
    answer:
      "DevPlan AI is for aspiring entrepreneurs, indie hackers, product managers, and developers who want to build successful products by making data-driven decisions from the very beginning.",
  },
  {
    question: "How does the AI analysis work?",
    answer:
      "Our platform uses a combination of large language models (LLMs) and proprietary algorithms to analyze your idea, research the market, and generate insights. We process your input to provide you with a detailed report on the viability of your idea.",
  },
  {
    question: "Is my idea secure?",
    answer:
      "Yes, we take data privacy and security very seriously. Your ideas are not shared with anyone and are not used to train our models. Please see our Privacy Policy for more details.",
  },
  {
    question: "What do I get in a build plan?",
    answer:
      "A build plan includes a summary of your app, a list of core features, a recommended tech stack, and a phased development roadmap. Each phase comes with detailed prompts to guide you or your development team.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel your subscription at any time. You will retain access to the features until the end of your billing period. Please refer to our Cancellations and Refunds policy for more information.",
  },
];

const FAQ = () => {
  return (
    <>
      <Helmet>
        <title>FAQ - DevPlan AI</title>
        <meta name="description" content="Frequently asked questions about DevPlan AI." />
      </Helmet>
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Can't find the answer you're looking for? Reach out to our{" "}
            <a href="/contact-us" className="text-primary hover:underline">
              support team
            </a>
            .
          </p>
        </header>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
};

export default FAQ;
