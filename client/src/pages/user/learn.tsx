import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Play } from "lucide-react";

const learningResources = [
  {
    id: 1,
    title: "The Journey of Your Recyclables",
    description: "Ever wonder what happens to your plastic bottles and paper after you put them in the recycling bin? This video follows the journey.",
    youtubeId: "s4LZw8wWfBU",
    category: "Recycling"
  },
  {
    id: 2,
    title: "Composting for Beginners: A Step-by-Step Guide",
    description: "Learn how to turn your kitchen scraps into nutrient-rich soil for your garden. It's easier than you think!",
    youtubeId: "V8miLevRI_o",
    category: "Composting"
  },
  {
    id: 3,
    title: "Understanding E-Waste: The Hidden Dangers",
    description: "Electronic waste is a growing problem. Find out why it's so hazardous and how to dispose of it responsibly.",
    youtubeId: "g49_a2FkDi8",
    category: "E-Waste"
  },
  {
    id: 4,
    title: "Zero Waste Lifestyle: 10 Simple Swaps",
    description: "Discover 10 easy changes you can make in your daily life to significantly reduce your waste and environmental impact.",
    youtubeId: "OagTXWfa6kM",
    category: "Lifestyle"
  },
  {
    id: 5,
    title: "The Problem with Plastic Pollution",
    description: "A deep dive into the global plastic crisis, its effects on our oceans and wildlife, and what we can do to combat it.",
    youtubeId: "1RDc2opwg0I",
    category: "Plastic Waste"
  },
  {
    id: 6,
    title: "How to Read Recycling Symbols",
    description: "Demystify the numbers and symbols on plastic containers to become a more effective and accurate recycler.",
    youtubeId: "J_MB84G_HqA",
    category: "Recycling"
  }
];

const LearnPage: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<typeof learningResources[number] | null>(null);

  const openVideo = (res: typeof learningResources[number]) => {
    setActive(res);
    setOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Learn | CleanCity</title>
        <meta name="description" content="Learn about waste management, recycling, composting, and more to help create a cleaner environment." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="text-center mb-10">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Hub</h1>
            <p className="text-lg text-gray-600">
              Empower yourself with knowledge to make a bigger impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learningResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video bg-black/5">
                  <img
                    src={`https://img.youtube.com/vi/${resource.youtubeId}/hqdefault.jpg`}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <Button
                    onClick={() => openVideo(resource)}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Play className="h-4 w-4 mr-2" /> Watch
                  </Button>
                </div>
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">{resource.category}</Badge>
                  <CardTitle>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription>{resource.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>{active?.title}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video">
                {active && (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1`}
                    title={active.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{active?.description}</p>
            </DialogContent>
          </Dialog>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default LearnPage;