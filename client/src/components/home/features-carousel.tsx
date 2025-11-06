import React from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Award, Recycle, ShieldCheck, Zap } from "lucide-react";

const features = [
  { text: "Community Powered", icon: <Users className="h-5 w-5 mr-3 text-primary" /> },
  { text: "Easy Reporting", icon: <MapPin className="h-5 w-5 mr-3 text-primary" /> },
  { text: "Earn Rewards", icon: <Award className="h-5 w-5 mr-3 text-primary" /> },
  { text: "Eco-Friendly", icon: <Recycle className="h-5 w-5 mr-3 text-primary" /> },
  { text: "Verified Cleanups", icon: <ShieldCheck className="h-5 w-5 mr-3 text-primary" /> },
  { text: "Quick Action", icon: <Zap className="h-5 w-5 mr-3 text-primary" /> },
];

const FeaturesCarousel: React.FC = () => {
  // Duplicate the features to create a seamless loop
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="w-full overflow-hidden bg-gray-50 py-4 border-y border-gray-200">
      <motion.div
        className="flex"
        animate={{
          x: ["0%", "-50%"], // Move from start to half-width (which is the length of one set of features)
        }}
        transition={{
          ease: "linear",
          duration: 25,
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {duplicatedFeatures.map((feature, index) => (
          <div
            key={index}
            className="flex items-center mx-8 text-lg font-medium text-gray-600 shrink-0"
          >
            {feature.icon}
            <span>{feature.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default FeaturesCarousel;