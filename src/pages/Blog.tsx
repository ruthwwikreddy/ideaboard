import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "The Rise of AI in Startup Idea Validation",
    description: "How artificial intelligence is changing the game for aspiring entrepreneurs.",
    date: "November 20, 2025",
    author: "Jane Doe",
    slug: "rise-of-ai-in-startup-idea-validation",
  },
  {
    id: 2,
    title: "A Deep Dive into Market Research with IdeaBoard",
    description: "Uncover market gaps and audience needs with the power of AI-driven research.",
    date: "November 15, 2025",
    author: "John Smith",
    slug: "deep-dive-market-research-devplan-ai",
  },
  {
    id: 3,
    title: "From Concept to Code: Building Your First App with a Solid Plan",
    description: "A step-by-step guide to turning your idea into a reality using a structured build plan.",
    date: "November 10, 2025",
    author: "Emily White",
    slug: "from-concept-to-code",
  },
];

const Blog = () => {
  return (
    <>
      <Helmet>
        <title>Blog - IdeaBoard</title>
        <meta name="description" content="Articles and insights on startups, idea validation, and AI-powered development from the IdeaBoard team." />
      </Helmet>
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">From the Blog</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Insights on startups, idea validation, and building great products.
          </p>
        </header>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{post.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">{post.author}</p>
                  <p className="text-sm text-muted-foreground">{post.date}</p>
                </div>
                <Link to={`/blog/${post.slug}`} className="flex items-center text-primary hover:underline">
                  Read more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;
