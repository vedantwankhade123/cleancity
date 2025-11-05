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

        {/* Desktop View with Connectors */}
        <div className="hidden md:flex items-start justify-center w-full">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <motion.div
                onClick={() => handleStepClick(index)}
                className="text-center p-6 rounded-xl cursor-pointer w-64 flex-shrink-0"
                animate={activeIndex === index ? "active" : "inactive"}
                variants={{
                  active: {
                    scale: 1.05,
                    borderColor: "hsl(var(--primary))",
                    backgroundColor: "hsl(var(--background))",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                  },
                  inactive: {
                    scale: 1,
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
                <motion.div
                  animate={{ opacity: activeIndex === index ? 1 : 0.7 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 px-2 text-sm">{step.description}</p>
                </motion.div>
              </motion.div>

              {index < steps.length - 1 && (
                <div className="relative flex-1 h-0.5 mt-10 -translate-y-1/2">
                  <div className="bg-gray-200 h-full w-full rounded-full" />
                  <motion.div
                    className="bg-primary h-full absolute top-0 left-0 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: activeIndex > index ? "100%" : "0%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 md:hidden gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              onClick={() => handleStepClick(index)}
              className="text-center p-6 rounded-xl cursor-pointer border-2"
              animate={activeIndex === index ? "active" : "inactive"}
              variants={{
                active: {
                  scale: 1.05,
                  borderColor: "hsl(var(--primary))",
                  backgroundColor: "hsl(var(--background))",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                },
                inactive: {
                  scale: 1,
                  borderColor: "transparent",
                  backgroundColor: "transparent",
                  boxShadow: "0 0 #0000",
                },
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div
                className={cn(
                  "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-500",
                  activeIndex === index
                    ? "bg-primary text-white"
                    : "bg-white text-primary"
                )}
              >
                <step.icon className="w-10 h-10" />
              </div>
              <motion.div
                animate={{ opacity: activeIndex === index ? 1 : 0.7 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 px-2 text-sm">{step.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;