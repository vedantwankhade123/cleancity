import React from "react";
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
import { Loader2, Check, X, UserPlus, AlertTriangle } from "lucide-react";
import { AdminRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { formatDate } from "@/lib/utils";

const AdminRequests: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery<AdminRequest[]>({
    queryKey: ["/api/admin-requests"],
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest("POST", `/api/admin-requests/${requestId}/approve`),
    onSuccess: () => {
      toast({ title: "Success", description: "Admin request approved." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin-requests"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve request.", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: number) => apiRequest("POST", `/api/admin-requests/${requestId}/reject`),
    onSuccess: () => {
      toast({ title: "Success", description: "Admin request rejected." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin-requests"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reject request.", variant: "destructive" });
    },
  });

  return (
    <>
      <Helmet>
        <title>Admin Requests | CleanCity</title>
        <meta name="description" content="Approve or reject new admin signup requests." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Requests</h1>
              </div>
            </div>
          </header>
          <main className="container px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Pending Admin Signups</CardTitle>
                <CardDescription>
                  Review and approve or reject requests from users who want to become admins for your city.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !requests || requests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Pending Requests</h3>
                    <p className="text-gray-500 mt-2">
                      There are currently no pending admin signup requests.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <p className="font-semibold">{request.fullName}</p>
                            <p className="text-sm text-gray-600">{request.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Requested on: {formatDate(request.createdAt)}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                              onClick={() => rejectMutation.mutate(request.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => approveMutation.mutate(request.id)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminRequests;