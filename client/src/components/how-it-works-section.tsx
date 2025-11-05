import React, { useState, useEffect } from "react";
import { UserPlus, Camera, MapPin, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account to get started.",
  },
  {
    icon: Camera,
    title: "Take a Photo",
    description: "Capture the waste with your device camera.",
  },
  {
    icon: MapPin,
    title: "Mark Location",
    description: "Set the waste location on the map.",
  },
  {
    icon: CheckCircle,
    title: "Submit Report",
    description: "Complete your report and earn points.",
  },
];

const HowItWorksSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % steps.length);
    }, 2500); // Change step every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">
            Making a difference is easy with our simple 4-step process
          </p>
        </div>

        <div className="relative">
          {/* Desktop connecting lines */}
          <div className="hidden md:flex absolute top-1/2 left-0 w-full h-1 -translate-y-1/2">
            <div className="w-full bg-gray-200 rounded-full h-1 relative">
              <motion.div
                className="bg-primary h-1 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center flex flex-col items-center">
                <div
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative z-10",
                    activeIndex === index
                      ? "bg-primary text-white scale-110 shadow-lg"
                      : "bg-white text-primary border-2 border-gray-200"
                  )}
                >
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold mt-6 mb-2">{step.title}</h3>
                <p className="text-gray-600 px-2">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;