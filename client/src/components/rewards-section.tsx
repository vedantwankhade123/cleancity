import React, { useState } from "react";
import { CheckCircle, Coins, Gift, Star } from "lucide-react";
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
      points: "50 points",
      description: "For each verified waste report you submit.",
      icon: <Gift className="h-6 w-6 text-primary" />,
    },
    {
      title: "Add Detailed Info",
      points: "25 bonus points",
      description: "For reports with clear photos and descriptions.",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      title: "Monthly Streak",
      points: "100 bonus points",
      description: "Submit 5 verified reports in a single month.",
      icon: <Star className="h-6 w-6 text-primary" />,
    },
  ];

  const redeemOptions = [
    { points: 500, reward: "₹5 Cash Reward" },
    { points: 1000, reward: "₹12 Cash Reward" },
    { points: 2500, reward: "₹35 Cash Reward" },
  ];

  return (
    <>
      <section id="rewards" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Contributions, Rewarded
            </h2>
            <p className="text-lg text-gray-600">
              Earn points for every action that helps make our cities cleaner,
              and redeem them for exciting rewards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
            {/* How to Earn Card */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl">How to Earn Points</CardTitle>
                  <CardDescription>
                    Start making an impact and collecting points today.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-6">
                    {earningMethods.map((method, index) => (
                      <li key={index} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {method.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {method.description}
                          </p>
                          <p className="text-primary font-bold text-sm mt-1">
                            {method.points}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Redeem Points Card */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="h-full bg-gray-900 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">
                    Redeem Your Points
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Turn your points into real cash rewards.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    {redeemOptions.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold text-lg">
                            {option.reward}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {option.points.toLocaleString()} points
                          </p>
                        </div>
                        <Coins className="h-6 w-6 text-accent" />
                      </div>
                    ))}
                  </div>
                </CardContent>
                {!isAuthenticated && (
                  <div className="p-6 mt-auto">
                    <Button
                      onClick={handleSignupClick}
                      className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold transition-transform hover:scale-105"
                      size="lg"
                    >
                      Sign Up to Start Earning
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
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