import React, { useState } from "react";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import HowItWorksSection from "@/components/how-it-works-section";
import RewardsSection from "@/components/rewards-section";
import ContactSection from "@/components/contact-section";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Users, MapPin, Award } from "lucide-react";

const Landing: React.FC<{ 
  setShowLoginModal: (show: boolean) => void;
  setShowSignupModal: (show: boolean) => void;
  setAuthType: (type: "user" | "admin") => void;
}> = ({ setShowLoginModal, setShowSignupModal, setAuthType }) => {
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    setAuthType("user");
    setShowSignupModal(true);
  };

  const handleSignIn = () => {
    setAuthType("user"); // Default to user login
    setShowLoginModal(true);
  };

  return (
    <>
      <Helmet>
        <title>CleanCity - Waste Management Platform</title>
        <meta name="description" content="Join CleanCity to identify and clean up waste in your neighborhood. Report waste, earn rewards, and make a difference for a cleaner, greener environment." />
        <meta property="og:title" content="CleanCity - Waste Management Platform" />
        <meta property="og:description" content="Join our community effort to identify and clean up waste in your neighborhood. Report waste, earn rewards, and make a difference." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pixabay.com/get/g43909b8fe0031cc5132a6c379627a6a02380090fa7d05cdfcf683908705533dd9d5fbcf483f37cad7d47eba363b0da0f9c618ebac6e0f78a382c01d2aaa906d3_1280.jpg" />
      </Helmet>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* About Section */}
        <AboutSection />
        
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens who are already making their cities cleaner and more beautiful.
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-primary hover:bg-primary/90"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </section>
        
        {/* Rewards Section */}
        <RewardsSection />
        
        {/* Contact Section */}
        <ContactSection />
      </main>
        
      <Footer />
    </>
  );
};

export default Landing;