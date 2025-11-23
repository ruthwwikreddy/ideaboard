import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Twitter } from "lucide-react";
import RuthwikAvatar from "@/assets/ruthwik.png";

const teamMembers = [
  {
    name: "Ruthwik Reddy",
    role: "Founder & Builder",
    avatar: RuthwikAvatar, // Using the imported image
    bio: "Turning problems into working products. Handles the full stack — product thinking, development, systems, and rapid execution. Focused on building tech that actually gets used, not just demoed.",
    social: {
      twitter: "#", // No Twitter provided
      linkedin: "https://www.linkedin.com/in/ruthwwikreddy/",
      github: "#", // No Github provided
    },
  },
  {
    name: "Anup Medhi",
    role: "Co-Founder & Product/Brand Strategy",
    avatar: "https://github.com/shadcn.png", // Placeholder avatar, replace if actual image is provided
    bio: "Brings a decade of experience in design thinking, UX, MVP shipping, and brand systems. Sharp at refining raw ideas into clear, usable, market-ready products. Leads product experience, design direction, and early-market positioning.",
    social: {
      twitter: "#", // No Twitter provided
      linkedin: "https://www.linkedin.com/in/anup-medhi-67881188/",
      github: "#", // No Github provided
    },
  },
];

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>About Us - IdeaBoard</title>
        <meta name="description" content="Learn about the team and mission behind IdeaBoard." />
      </Helmet>
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Our Mission</h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-3xl mx-auto">
            We believe that every great product starts with a great idea and an even better plan. Our mission is to empower founders, developers, and creators to turn their visions into reality by providing them with the best AI-powered tools for validation and planning.
          </p>
        </header>

        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">Meet the Team</h2>
          <div className="grid gap-10 md:grid-cols-2 justify-center">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <div className="mb-6 flex justify-center">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-48 h-auto rounded-xl shadow-md object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-primary mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center gap-4">
                  <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
