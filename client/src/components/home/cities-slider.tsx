import React from "react";
import { motion } from "framer-motion";

const cities = [
  "Mumbai",
  "Pune",
  "Nagpur",
  "Thane",
  "Nashik",
  "Aurangabad",
  "Solapur",
  "Amravati",
  "Kolhapur",
  "Nanded",
  "Sangli",
  "Jalgaon",
  "Akola",
  "Latur",
  "Dhule",
  "Ahmednagar",
  "Chandrapur",
  "Parbhani",
  "Ichalkaranji",
  "Jalna",
];

const CitiesSlider: React.FC = () => {
  return (
    <div className="w-full overflow-hidden py-4">
      <div className="relative">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{
            x: [0, -1000],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 20,
              ease: "linear",
            },
          }}
        >
          {[...cities, ...cities].map((city, index) => (
            <div
              key={index}
              className="inline-flex items-center mx-8 text-lg font-medium text-white"
            >
              {city}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CitiesSlider; 