import React, { useState, useEffect, useRef } from "react";
import { UserPlus, Camera, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    title: "1. Sign Up",
    description: "Create your free account to join our community of city cleaners.",
  },
  {
    icon: Camera,
    title: "2. Report Waste",
    description: "Spot an issue? Snap a photo and provide a quick description.",
  },
  {
    icon: MapPin,
    title: "3. Mark Location",
    description: "Pinpoint the exact location on the map for our cleanup crews.",
  },
  {
    icon: CheckCircle,
    title: "4. Get Rewarded",
    description: "Once the issue is resolved, you earn points for your contribution.",
  },
];

const HowItWorksSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlideshow = () => {
    stopSlideshow(); // Ensure no multiple intervals are running
    intervalRef.current = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % steps.length);
    }, 4000); // Change step every 4 seconds
  };

  const stopSlideshow = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    startSlideshow();
    return () => stopSlideshow();
  }, []);

  const handleStepClick = (index: number) => {
    stopSlideshow();
    setActiveIndex(index);
  };

  return (
    <section id="how-it-works" className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">
            Making a difference is easy with our simple 4-step process.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                onClick={() => handleStepClick(index)}
                className="text-center p-6 rounded-xl cursor-pointer border-2"
                animate={activeIndex === index ? "active" : "inactive"}
                variants={{
                  active: {
                    scale: 1.05,
                    opacity: 1,
                    borderColor: "hsl(var(--primary))",
                    backgroundColor: "hsl(var(--background))",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                  },
                  inactive: {
                    scale: 1,
                    opacity: 0.7,
                    borderColor: "transparent",
                    backgroundColor: "transparent",
                    boxShadow: "0 0 #0000",
                  },
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div
                  className={cn(
                    "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-500 relative z-10 border-2",
                    activeIndex === index
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-primary border-gray-200"
                  )}
                >
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 px-2 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;