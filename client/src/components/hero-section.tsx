import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/dialogs/auth-modal";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Flag, CheckCircle, Award } from "lucide-react";
import FeaturesCarousel from "@/components/home/features-carousel";

const HeroSection: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [authType, setAuthType] = useState<"user" | "admin">("user");

  const handleReportWaste = () => {
    if (isAuthenticated) {
      navigate(user?.role === "admin" ? "/admin/reports" : "/user/report-new");
    } else {
      setAuthType("user");
      setShowSignupModal(true);
    }
  };

  const handleAdminLogin = () => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      setAuthType("admin");
      setShowLoginModal(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="home" className="relative w-full bg-gradient-to-br from-gray-50 via-white to-green-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 items-center min-h-screen pt-24 md:pt-0 pb-12">
          {/* Left Column: Text Content */}
          <motion.div
            className="md:col-span-2 text-center md:text-left flex flex-col justify-center items-center md:items-start"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl leading-tight mb-6 text-shine pb-4"
              variants={itemVariants}
            >
              Transforming Our Cities <span className="gradient-text">Together.</span>
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 mb-10 max-w-lg"
              variants={itemVariants}
            >
              Be a part of the change. Spot, report, and resolve cleanliness
              issues in your community with CleanCity.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <Button
                onClick={handleReportWaste}
                size="lg"
                className="px-8 py-6 bg-primary hover:bg-primary-dark text-white text-lg font-semibold shadow-lg transition-transform hover:scale-105"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={handleAdminLogin}
                variant="outline"
                size="lg"
                className="px-8 py-6 bg-transparent text-primary border-primary hover:bg-primary/5 text-lg font-semibold shadow-lg transition-transform hover:scale-105"
              >
                Admin Login
              </Button>
            </motion.div>

            <motion.div
              className="mt-16 flex flex-row flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 sm:gap-x-6 text-gray-700"
              variants={itemVariants}
            >
              <div className="flex items-center gap-3">
                <Flag className="h-6 w-6 text-accent" />
                <span className="font-medium">Report Issues</span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-accent" />
                <span className="font-medium">Track Progress</span>
              </div>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-accent" />
                <span className="font-medium">Earn Rewards</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Illustration */}
          <motion.div 
            className="md:col-span-3 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img 
              src="/cleancity hero.png" 
              alt="Clean City Illustration" 
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </div>

      {/* Features Carousel at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <FeaturesCarousel />
      </div>

      {/* Auth Modals */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        type="login"
        userType={authType}
        onSwitchType={(type, userType) => {
          setShowLoginModal(false);
          setShowSignupModal(true);
          setAuthType(userType);
        }}
      />

      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        type="signup"
        userType={authType}
        onSwitchType={(type, userType) => {
          setShowSignupModal(false);
          setShowLoginModal(true);
          setAuthType(userType);
        }}
      />
    </section>
  );
};

export default HeroSection;