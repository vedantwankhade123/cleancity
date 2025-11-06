import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Flag, Coins, CheckCircle, Loader2 } from "lucide-react";
import { Report } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import StatsCard from "@/components/stats-card";
import ReportCard from "@/components/report-card";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Helmet } from "react-helmet";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

  // Fetch user reports
  const { 
    data: reports, 
    isLoading, 
    isError,
    error 
  } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Count reports by status
  const getTotalReports = () => reports?.length || 0;
  const getCompletedReports = () => reports?.filter(r => r.status === "completed").length || 0;
  const getInProgressReports = () => reports?.filter(r => r.status === "processing").length || 0;
  const getPendingReports = () => reports?.filter(r => r.status === "pending").length || 0;

  // Calculate total reward points
  const getTotalRewardPoints = () => {
    return user?.rewardPoints || 0;
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | CleanCity</title>
        <meta name="description" content="User dashboard for CleanCity. View your reports, track status, and check reward points." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
            <p className="text-gray-600">Here's an overview of your waste reports and rewards</p>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Reports"
              value={getTotalReports()}
              icon={Flag}
              description="All waste reports you have submitted."
              linkTo="/user/reports"
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />
            
            <StatsCard
              title="Completed"
              value={getCompletedReports()}
              icon={CheckCircle}
              description="Issues that have been successfully resolved."
              linkTo="/user/reports"
              iconColor="text-green-600"
              iconBgColor="bg-green-100"
            />
            
            <StatsCard
              title="In Progress"
              value={getInProgressReports()}
              icon={Loader2}
              description="Reports currently being addressed by the authorities."
              linkTo="/user/reports"
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100"
            />
            
            <StatsCard
              title="Reward Points"
              value={getTotalRewardPoints()}
              icon={Coins}
              description="Points earned from your valuable contributions."
              linkTo="/user/rewards"
              iconColor="text-accent"
              iconBgColor="bg-accent/10"
            />
          </div>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="reports" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="reports">My Reports</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
              </TabsList>
              
              <Link href="/user/report-new">
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  New Report
                </Button>
              </Link>
            </div>
            
            <TabsContent value="reports" className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                  Error loading reports: {(error as Error).message}
                </div>
              ) : reports?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Flag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium">No reports yet</h3>
                  <p className="text-gray-500 mt-2 mb-4">Submit your first waste report to get started</p>
                  <Link href="/user/report-new">
                    <Button>Submit a Report</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports?.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rewards">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{getTotalRewardPoints()} Points</h3>
                    <p className="text-gray-500">Available reward points</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium mb-4">Available Rewards</h4>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium">₹50 Cash Reward</h5>
                        <p className="text-sm text-gray-500">500 points required</p>
                      </div>
                      <Button 
                        variant="outline" 
                        disabled={getTotalRewardPoints() < 500}
                      >
                        Redeem
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium">₹100 Cash Reward</h5>
                        <p className="text-sm text-gray-500">1000 points required</p>
                      </div>
                      <Button 
                        variant="outline" 
                        disabled={getTotalRewardPoints() < 1000}
                      >
                        Redeem
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium">₹250 Cash Reward</h5>
                        <p className="text-sm text-gray-500">2500 points required</p>
                      </div>
                      <Button 
                        variant="outline" 
                        disabled={getTotalRewardPoints() < 2500}
                      >
                        Redeem
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default UserDashboard;