import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/dialogs/auth-modal";
import { useLocation } from "wouter";
import { TypingAnimation } from "@/components/ui/typing-animation";

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

  return (
    <section id="home" className="relative">
      <div 
        className="relative min-h-[96.5vh] flex flex-col items-center justify-center rounded-[40px] overflow-hidden pt-24 pb-12 m-[10px]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1920&h=1080')",
          backgroundSize: "cover", 
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl mb-6 min-h-[4.5rem] md:min-h-[5.5rem] flex items-center justify-center">
              <TypingAnimation 
                texts={[
                  "Keep Your City Clean & Green",
                  "Report Waste, Make a Difference",
                  "Join CleanCity",
                  "Together for a Cleaner Tomorrow"
                ]}
                transitionDuration={800}
                displayDuration={3000}
                className="text-center"
                cursorClassName="bg-white"
                textClassName="text-white"
                showCursor={false}
              />
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Join our community effort to identify and clean up waste in your neighborhood. Report waste, earn rewards, and make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleReportWaste} 
                size="lg"
                className="px-6 py-6 bg-accent hover:bg-accent-dark text-white text-lg font-medium"
              >
                Report Waste
              </Button>
              <Button
                onClick={handleAdminLogin}
                variant="secondary"
                size="lg"
                className="px-6 py-6 bg-white/20 backdrop-blur-sm text-white border border-white hover:bg-white/30 text-lg font-medium"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modals */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        type="login"
        userType={authType}
        onSwitchType={(type) => {
          setShowLoginModal(false);
          setShowSignupModal(true);
          setAuthType(type);
        }}
      />

      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        type="signup"
        userType={authType}
        onSwitchType={(type) => {
          setShowSignupModal(false);
          setShowLoginModal(true);
          setAuthType(type);
        }}
      />
    </section>
  );
};

export default HeroSection;
