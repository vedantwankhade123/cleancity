import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, MoreVertical } from "lucide-react";
import { Report } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ReportStatusBadge from "@/components/report-status-badge";
import { formatDate, formatRewardPoints, timeAgo, truncateText } from "@/lib/utils";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ReportCardProps {
  report: Report;
  isAdmin?: boolean;
  onUpdateStatus?: (reportId: number, status: string) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, isAdmin = false, onUpdateStatus }) => {
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
  
  const handleStatusUpdate = (status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(report.id, status);
    }
  };
  
  return (
    <>
      <Card className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden">
                  <img 
                    src={report.imageUrl} 
                    alt={report.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">{report.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Reported on: {formatDate(report.createdAt)}
                  </p>
                  <div className="flex items-center">
                    <MapPin className="text-primary mr-1 h-4 w-4" />
                    <span className="text-sm text-gray-600">{report.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ReportStatusBadge status={report.status} />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                      View Details
                    </DropdownMenuItem>
                    
                    {isAdmin && report.status === "pending" && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate("processing")}>
                        Mark as Processing
                      </DropdownMenuItem>
                    )}
                    
                    {isAdmin && (report.status === "pending" || report.status === "processing") && (
                      <DropdownMenuItem onClick={() => handleStatusUpdate("completed")}>
                        Mark as Completed
                      </DropdownMenuItem>
                    )}
                    
                    {isAdmin && report.status === "pending" && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusUpdate("rejected")}
                        className="text-destructive"
                      >
                        Reject Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">{truncateText(report.description, 150)}</p>
            </div>
            
            {report.rewardPoints && report.status === "completed" && (
              <div className="mt-4 flex justify-end">
                <span className="bg-accent/10 text-accent px-2 py-1 rounded text-sm font-medium">
                  {formatRewardPoints(report.rewardPoints)} points
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Report Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="rounded-md overflow-hidden mb-4">
                <img 
                  src={report.imageUrl} 
                  alt={report.title} 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              <div className="text-sm text-gray-500 space-y-2">
                <p>
                  <span className="font-medium">Reported:</span> {timeAgo(report.createdAt)}
                </p>
                {report.completedAt && (
                  <p>
                    <span className="font-medium">Completed:</span> {timeAgo(report.completedAt)}
                  </p>
                )}
                <p>
                  <span className="font-medium">Status:</span> <ReportStatusBadge status={report.status} />
                </p>
                {report.rewardPoints && (
                  <p>
                    <span className="font-medium">Reward Points:</span> {report.rewardPoints}
                  </p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">{report.title}</h3>
              <p className="text-gray-700 mb-4">{report.description}</p>
              
              <div className="p-3 bg-gray-100 rounded-md mb-4">
                <h4 className="font-medium mb-1">Location</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-1" />
                  <span className="text-gray-600">{report.address}</span>
                </div>
              </div>
              
              {report.adminNotes && (
                <div className="p-3 bg-primary/5 rounded-md">
                  <h4 className="font-medium mb-1">Admin Notes</h4>
                  <p className="text-gray-600">{report.adminNotes}</p>
                </div>
              )}
              
              {isAdmin && (
                <div className="mt-6 space-x-2">
                  {report.status === "pending" && (
                    <>
                      <Button onClick={() => handleStatusUpdate("processing")}>
                        Start Processing
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleStatusUpdate("rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {report.status === "processing" && (
                    <Button onClick={() => handleStatusUpdate("completed")}>
                      Mark as Completed
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportCard;