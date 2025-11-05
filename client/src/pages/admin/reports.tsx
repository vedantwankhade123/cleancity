import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Filter,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Report } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import ReportCard from "@/components/report-card";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Helmet } from "react-helmet";

const AdminReports: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"processing" | "completed" | "rejected">("processing");

  // Get report ID from URL if present
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const reportIdParam = searchParams.get("id");

  // Fetch all reports
  const { 
    data: reports, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter reports based on status and search query
  const filteredReports = reports?.filter(report => {
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Find report by ID from URL param
  useEffect(() => {
    if (reportIdParam && reports) {
      const report = reports.find(r => r.id === parseInt(reportIdParam));
      if (report) {
        setSelectedReport(report);
        setAdminNotes(report.adminNotes || "");
      }
    }
  }, [reportIdParam, reports]);

  // Update report status mutation
  const updateReportStatusMutation = useMutation({
    mutationFn: async ({ reportId, status, notes }: { reportId: number; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/reports/${reportId}/status`, {
        status,
        adminNotes: notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsUpdateDialogOpen(false);
      toast({
        title: "Success",
        description: "Report status has been updated.",
      });
      // Remove the report ID from URL
      setLocation("/admin/reports");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update report status.",
        variant: "destructive",
      });
    },
  });

  // Handle report status update
  const handleUpdateStatus = (reportId: number, status: string) => {
    const report = reports?.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setAdminNotes(report.adminNotes || "");
      setUpdateStatus(status as "processing" | "completed" | "rejected");
      setIsUpdateDialogOpen(true);
    }
  };

  // Handle status update confirmation
  const confirmStatusUpdate = () => {
    if (selectedReport) {
      updateReportStatusMutation.mutate({
        reportId: selectedReport.id,
        status: updateStatus,
        notes: adminNotes
      });
    }
  };

  // Get status update dialog title and description
  const getDialogContent = () => {
    switch (updateStatus) {
      case "processing":
        return {
          title: "Start Processing Report",
          description: "Mark this report as in-progress. The reporter will be notified that their report is being addressed.",
          icon: <Loader2 className="h-6 w-6 text-orange-500" />,
          buttonText: "Start Processing",
          buttonVariant: "default" as const,
        };
      case "completed":
        return {
          title: "Mark Report as Completed",
          description: "Confirm that this waste issue has been resolved. The reporter will earn reward points.",
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          buttonText: "Mark as Completed",
          buttonVariant: "default" as const,
        };
      case "rejected":
        return {
          title: "Reject this Report",
          description: "Reject this report if it's invalid, duplicated, or cannot be addressed.",
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          buttonText: "Reject Report",
          buttonVariant: "destructive" as const,
        };
      default:
        return {
          title: "Update Report Status",
          description: "Update the status of this report",
          icon: null,
          buttonText: "Update",
          buttonVariant: "default" as const,
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <>
      <Helmet>
        <title>Manage Reports | CleanCity Admin</title>
        <meta name="description" content="Review and manage waste reports from citizens. Process, complete, or reject reports." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1 md:ml-[calc(16rem+10px)]">
          {/* Admin Dashboard Header */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Waste Reports</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Reports Management */}
          <main className="container px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Manage Reports</CardTitle>
                    <CardDescription>
                      Review and manage waste reports from citizens
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search reports..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isError ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    Error loading reports: {(error as Error).message}
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No reports found</h3>
                    <p className="text-gray-500 mt-2 mb-4">
                      There are no waste reports in your city yet
                    </p>
                  </div>
                ) : filteredReports && filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No matching reports</h3>
                    <p className="text-gray-500 mt-2">
                      Try changing your filters to see more results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports?.map((report) => (
                      <ReportCard 
                        key={report.id} 
                        report={report} 
                        isAdmin={true}
                        onUpdateStatus={(reportId, status) => handleUpdateStatus(reportId, status)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
          
          {/* Status Update Dialog */}
          {selectedReport && (
            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    {dialogContent.icon}
                    <DialogTitle>{dialogContent.title}</DialogTitle>
                  </div>
                  <DialogDescription>
                    {dialogContent.description}
                  </DialogDescription>
                </DialogHeader>
                
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-1">Report Details</h3>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className="font-medium">Title:</span> {selectedReport.title}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(selectedReport.createdAt)}
                        </div>
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{selectedReport.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Admin Notes</label>
                    <Textarea
                      placeholder="Add notes about this report and any actions taken"
                      rows={4}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsUpdateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={dialogContent.buttonVariant}
                    onClick={confirmStatusUpdate}
                    disabled={updateReportStatusMutation.isPending}
                  >
                    {updateReportStatusMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      dialogContent.buttonText
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminReports;