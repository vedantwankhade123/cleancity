import React from "react";
import { MapPin, Recycle, Gift } from "lucide-react";

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About CleanCity</h2>
          <p className="text-lg text-gray-600">
            Our mission is to create cleaner, more sustainable cities through community-driven waste management.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Feature 1 */}
          <div className="text-center p-6">
            <div className="feature-icon bg-primary/10">
              <MapPin className="text-2xl text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Report Waste</h3>
            <p className="text-gray-600">
              Easily report waste in your area by taking a photo and marking the location.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="text-center p-6">
            <div className="feature-icon bg-secondary/10">
              <Recycle className="text-2xl text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Cleanup</h3>
            <p className="text-gray-600">
              Monitor the status of your reports and see when they've been addressed.
            </p>
          </div>
          
          {/* Feature 3 */}
          <div className="text-center p-6">
            <div className="feature-icon bg-accent/10">
              <Gift className="text-2xl text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-600">
              Get reward points for your contributions that can be redeemed for cash.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;