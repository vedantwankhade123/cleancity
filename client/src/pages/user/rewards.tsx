import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Coins, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/layout/navbar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Footer from "@/components/layout/footer";
import { formatDate } from "@/lib/utils";

type Report = {
  id: string;
  status: string;
  rewardPoints?: number;
  createdAt: string;
  title?: string;
  completedAt?: string;
  // Add other report fields as needed
};

const UserRewards: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch user reports to calculate total points earned
  const { 
    data: reports, 
    isLoading, 
    isError 
  } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Calculate total reward points
  const totalPoints = user?.rewardPoints || 0;
  
  // Get completed reports with rewards
  const completedReportsWithRewards = reports?.filter(
    (report) => report.status === "completed" && report.rewardPoints
  ) || [];

  // State for auth modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [authType, setAuthType] = useState<"user" | "admin">("user");
  const { toast } = useToast();

  // Fetch user points data
  const { refetch } = useQuery({
    queryKey: ['userPoints'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/points');
      return response;
    },
  });

  const handleRedeemReward = async (points: number, amount: string) => {
    try {
      const response = await apiRequest('POST', '/api/rewards/redeem', {
        points,
        amount
      });
      
      const data = await response.json(); // Parse the JSON response
      
      if (response.ok && data.success) { // Check both response.ok and your custom success flag
        toast({
          title: "Success!",
          description: `You've successfully redeemed ${points} points for ${amount} cash reward.`,
          variant: "default",
        });
        // Refetch points balance
        refetch();
      } else {
        throw new Error(data.message || 'Failed to redeem reward');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to redeem reward",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Rewards | CleanCity</title>
        <meta name="description" content="View your reward points earned from waste reports and redeem them for cash rewards." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar 
          setShowLoginModal={setShowLoginModal}
          setShowSignupModal={setShowSignupModal}
          setAuthType={setAuthType}
        />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Rewards Center</h1>
            <p className="text-gray-600">Redeem your earned points for cash rewards</p>
          </div>
          
          {/* Points Summary Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Coins className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Points</p>
                    <h2 className="text-3xl font-bold">{totalPoints}</h2>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Rewards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Available Rewards</CardTitle>
                  <CardDescription>
                    Redeem your points for these rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Coins className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">₹500 Cash Reward</h3>
                                <p className="text-sm text-gray-500">500 points</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRedeemReward(500, "₹500")}
                              disabled={!totalPoints || totalPoints < 500}
                            >
                              Redeem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Coins className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">₹1000 Cash Reward</h3>
                                <p className="text-sm text-gray-500">1000 points</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRedeemReward(1000, "₹1000")}
                              disabled={!totalPoints || totalPoints < 1000}
                            >
                              Redeem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Coins className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">₹2500 Cash Reward</h3>
                                <p className="text-sm text-gray-500">2500 points</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRedeemReward(2500, "₹2500")}
                              disabled={!totalPoints || totalPoints < 2500}
                            >
                              Redeem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Coins className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">₹1000 Cash Reward</h3>
                                <p className="text-sm text-gray-500">1000 points</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRedeemReward(1000, "₹1000")}
                              disabled={!totalPoints || totalPoints < 1000}
                            >
                              Redeem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <Coins className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">₹2500 Cash Reward</h3>
                                <p className="text-sm text-gray-500">2500 points</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleRedeemReward(2500, "₹2500")}
                              disabled={!totalPoints || totalPoints < 2500}
                            >
                              Redeem
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Points History */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Points History</CardTitle>
                  <CardDescription>
                    History of points earned and redeemed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {completedReportsWithRewards.length > 0 ? (
                    <div className="space-y-4">
                      {completedReportsWithRewards.map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Coins className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium">Report #{report.id}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(new Date(report.createdAt))}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+{report.rewardPoints} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No reward history available
                    </div>
                  )}
                </CardContent>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : isError || completedReportsWithRewards.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                        <Coins className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium">No points history yet</h3>
                      <p className="text-gray-500 mt-2">
                        Complete waste reports to earn points
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {completedReportsWithRewards.map((report) => (
                        <div 
                          key={report.id} 
                          className="flex items-start justify-between border-b border-gray-100 pb-3"
                        >
                          <div>
                            <p className="font-medium">{report.title}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(report.completedAt || report.createdAt)}
                            </p>
                          </div>
                          <div className="text-accent font-medium">
                            +{report.rewardPoints} points
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default UserRewards;