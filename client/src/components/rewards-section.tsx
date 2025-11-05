import React, { useState } from "react";
import { CheckCircle, Coins, Gift, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import AuthModal from "@/components/dialogs/auth-modal";
import { motion } from "framer-motion";

const RewardsSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  const earningMethods = [
    {
      title: "Submit a Report",
      points: "+50 points",
      description: "For each verified waste report.",
      icon: Gift,
    },
    {
      title: "Add Detailed Info",
      points: "+25 bonus",
      description: "For reports with clear photos.",
      icon: CheckCircle,
    },
    {
      title: "Monthly Streak",
      points: "+100 bonus",
      description: "For 5+ reports in a month.",
      icon: Star,
    },
  ];

  const redeemOptions = [
    { points: 500, reward: "₹50 Cash Reward" },
    { points: 1000, reward: "₹100 Cash Reward" },
    { points: 2500, reward: "₹250 Cash Reward" },
  ];

  return (
    <>
      <section id="rewards" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Contributions, <span className="gradient-text">Rewarded.</span>
            </h2>
            <p className="text-lg text-gray-600">
              Earn points for every action that helps make our cities cleaner,
              and redeem them for cash rewards.
            </p>
          </motion.div>

          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden shadow-lg border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side: How to Earn */}
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">How to Earn Points</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {earningMethods.map((method, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <method.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-800">
                              {method.title}
                            </h4>
                            <p className="text-primary font-bold text-sm">
                              {method.points}
                            </p>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Redeem Points */}
                <div className="bg-gray-50 p-8 flex flex-col">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-6">Redeem for Rewards</h3>
                  <div className="space-y-4 flex-grow">
                    {redeemOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Coins className="h-5 w-5 text-accent" />
                          <div>
                            <h4 className="font-semibold">
                              {option.reward}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {option.points.toLocaleString()} points
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isAuthenticated && (
                    <div className="mt-8">
                      <Button
                        onClick={handleSignupClick}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold transition-transform hover:scale-105 gap-2"
                        size="lg"
                      >
                        Sign Up to Start Earning
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        type="signup"
        userType="user"
        onSwitchType={() => {}}
      />
    </>
  );
};

export default RewardsSection;