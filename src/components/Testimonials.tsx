import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Alex Hormozi",
    role: "Founder, Acquisition.com",
    testimonial:
      "This is the first time I have seen an AI tool that actually helps you build a business. It's not just a toy, it's a real tool.",
    avatar: "https://github.com/shadcn.png",
  },
  {
    name: "Sahil Lavingia",
    role: "Founder, Gumroad",
    testimonial:
      "IdeaBoard is like having a co-founder that does all the boring work for you. It's a game-changer for solo founders.",
    avatar: "https://github.com/shadcn.png",
  },
  {
    name: "Naval Ravikant",
    role: "Founder, AngelList",
    testimonial:
      "The quality of the research and the build plan is surprisingly good. It's a great starting point for any new project.",
    avatar: "https://github.com/shadcn.png",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">
            Loved by builders
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Hear what successful founders are saying about IdeaBoard.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card border-border flex flex-col">
              <CardContent className="p-6 flex-grow">
                <p className="text-lg mb-4 flex-grow">"{testimonial.testimonial}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Testimonials;
