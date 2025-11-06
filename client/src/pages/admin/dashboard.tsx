import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Bookmark,
  Calendar as CalendarIcon,
  Flag,
  MoreVertical,
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Users,
  Activity,
  Bell,
} from "lucide-react";
import { Report, User as UserType } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import StatsCard from "@/components/stats-card";
import ReportStatusBadge from "@/components/report-status-badge";
import { formatDate, timeAgo } from "@/lib/utils";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange, DayContent, type DayContentProps } from "react-day-picker";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import InteractiveMap from "@/components/admin/interactive-map";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  link: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastRead, setLastRead] = useState(new Date(0));
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`lastRead_${user.id}`);
      setLastRead(saved ? new Date(saved) : new Date(0));
    }
  }, [user?.id]);

  // Fetch reports
  const { 
    data: reports, 
    isLoading: isLoadingReports 
  } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch users
  const { 
    data: users, 
    isLoading: isLoadingUsers 
  } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json() as Notification[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 1, // refetch every minute
  });

  const hasUnread = notifications && notifications.some(n => new Date(n.timestamp) > lastRead);

  const handleMarkAllAsRead = () => {
    if (!user?.id) return;
    const now = new Date();
    localStorage.setItem(`lastRead_${user.id}`, now.toISOString());
    setLastRead(now);
  };

  const handleClearAll = () => {
    if (!user?.id) return;
    queryClient.setQueryData(['notifications', user?.id], []);
  };

  // Process reports to create a map of events by date
  const reportEventsByDate = React.useMemo(() => {
    if (!reports) return {};
    
    const events: Record<string, Set<string>> = {};

    reports.forEach(report => {
      // Submitted (blue)
      const createdDate = format(new Date(report.createdAt), 'yyyy-MM-dd');
      if (!events[createdDate]) events[createdDate] = new Set();
      events[createdDate].add('submitted');

      // Completed (green)
      if (report.completedAt) {
        const completedDate = format(new Date(report.completedAt), 'yyyy-MM-dd');
        if (!events[completedDate]) events[completedDate] = new Set();
        events[completedDate].add('completed');
      }

      // Processing (yellow) & Rejected (red)
      if (report.status === 'processing' || report.status === 'rejected') {
         const updatedDate = format(new Date(report.updatedAt), 'yyyy-MM-dd');
         if (!events[updatedDate]) events[updatedDate] = new Set();
         events[updatedDate].add(report.status);
      }
    });

    return events;
  }, [reports]);

  // Custom DayContent component to render dots
  function DayContentWithDots(props: DayContentProps) {
    const dayString = format(props.date, 'yyyy-MM-dd');
    const events = reportEventsByDate[dayString];

    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <DayContent {...props} />
        {events && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
            {events.has('submitted') && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Report Submitted" />}
            {events.has('processing') && <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" title="Report Processing" />}
            {events.has('rejected') && <div className="h-1.5 w-1.5 rounded-full bg-red-500" title="Report Rejected" />}
            {events.has('completed') && <div className="h-1.5 w-1.5 rounded-full bg-green-500" title="Report Completed" />}
          </div>
        )}
      </div>
    );
  }

  // Filter reports based on selected date range
  const filteredReports = React.useMemo(() => {
    if (!reports) return [];
    if (!date?.from) return reports;

    const fromDate = date.from;
    const toDate = date.to ? new Date(date.to.setHours(23, 59, 59, 999)) : new Date(new Date().setHours(23, 59, 59, 999));

    return reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= fromDate && reportDate <= toDate;
    });
  }, [reports, date]);

  // Count reports by status using filtered data
  const getTotalReports = () => filteredReports?.length || 0;
  const getReportsByStatus = (status: string) => 
    filteredReports?.filter(r => r.status === status).length || 0;

  // Recent activity data generation using filtered data
  const getRecentActivity = () => {
    if (!filteredReports) return [];
    
    const sortedReports = [...filteredReports].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return sortedReports.slice(0, 4);
  };

  const recentActivity = getRecentActivity();

  // Get icon for activity
  const getActivityIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-600" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-orange-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const isLoading = isLoadingReports || isLoadingUsers;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | CleanCity</title>
        <meta name="description" content="CleanCity Admin Dashboard - Manage waste reports and users in your city." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1 md:ml-[calc(16rem+10px)]">
          {/* Admin Dashboard Header */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 w-auto md:w-[240px] justify-start text-left font-normal">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="hidden md:inline">
                          {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            "Pick a date"
                          )}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        components={{
                          DayContent: DayContentWithDots,
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-gray-700 hover:bg-gray-100">
                        <Bell className="h-5 w-5" />
                        {hasUnread && (
                          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-2 h-2" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-2 flex justify-between items-center">
                        <div className="font-medium">Notifications</div>
                        <div className="flex gap-2">
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={handleMarkAllAsRead} disabled={!hasUnread}>Mark all as read</Button>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-destructive" onClick={handleClearAll} disabled={!notifications || notifications.length === 0}>Clear all</Button>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                        ) : notifications && notifications.length > 0 ? (
                          notifications.map(n => (
                            <Link href={n.link} key={n.id}>
                              <a className="block p-2 rounded-md hover:bg-gray-100 text-sm cursor-pointer">
                                <p className="font-medium">{n.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{timeAgo(n.timestamp)}</p>
                              </a>
                            </Link>
                          ))
                        ) : (
                          <div className="text-center text-sm text-gray-500 p-4">No new notifications</div>
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {user?.fullName?.split(" ")[0] || "Admin"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Admin Dashboard Content */}
          <main className="container px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600">Welcome back, Admin. Here's what's happening in your city.</p>
            </div>

            {/* Admin Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Reports"
                value={getTotalReports()}
                icon={Flag}
                description="All reports submitted in your city for the selected period."
                linkTo="/admin/reports"
                iconColor="text-primary"
                iconBgColor="bg-primary/10"
              />
              
              <StatsCard
                title="Pending Review"
                value={getReportsByStatus("pending")}
                icon={Clock}
                description="New reports that are awaiting your review and action."
                linkTo="/admin/reports"
                iconColor="text-gray-600"
                iconBgColor="bg-gray-100"
              />
              
              <StatsCard
                title="In Progress"
                value={getReportsByStatus("processing")}
                icon={Loader2}
                description="Reports that are currently being processed and worked on."
                linkTo="/admin/reports"
                iconColor="text-orange-600"
                iconBgColor="bg-orange-100"
              />
              
              <StatsCard
                title="Completed"
                value={getReportsByStatus("completed")}
                icon={CheckCircle}
                description="Issues that have been successfully resolved and closed."
                linkTo="/admin/reports"
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
              />
            </div>

            {/* Map and Activity Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Card className="h-[500px]">
                  <CardHeader>
                    <CardTitle>Reports Map</CardTitle>
                    <CardDescription>Live overview of reported issues in your city.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(500px-78px)] p-0">
                    {isLoadingReports ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <InteractiveMap reports={reports || []} />
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Activity Timeline */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h3 className="text-xl font-bold">Recent Activity</h3>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !recentActivity || recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No recent activity</h3>
                      <p className="text-gray-500 mt-2">
                        Activity will appear here as reports are processed
                      </p>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {recentActivity.map((activity, index) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {index < recentActivity.length - 1 && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                    {getActivityIcon(activity.status)}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      {activity.status === "completed" && "Completed report "}
                                      {activity.status === "processing" && "Processing report "}
                                      {activity.status === "rejected" && "Rejected report "}
                                      {activity.status === "pending" && "New report "}
                                      <span className="font-medium">{activity.title}</span>
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <span>{timeAgo(activity.updatedAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Reports and User Management */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Recent Reports */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold">Recent Reports</h3>
                  <Link href="/admin/reports">
                    <Button variant="link" className="text-primary hover:text-primary-dark font-medium">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !filteredReports || filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                      <Flag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No reports in this period</h3>
                      <p className="text-gray-500 mt-2">
                        Try selecting a different date range to see reports.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredReports.slice(0, 4).map((report) => (
                              <tr key={report.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="flex-shrink-0 h-10 w-10 rounded bg-gray-200 overflow-hidden"><img src={report.imageUrl} alt={report.title} className="h-10 w-10 object-cover" /></div><div className="ml-4"><div className="text-sm font-medium text-gray-900">{report.title}</div><div className="text-sm text-gray-500">Reported by: User #{report.userId}</div></div></div></td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{report.address.split(",")[0]}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{formatDate(report.createdAt)}</div><div className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></td>
                                <td className="px-6 py-4 whitespace-nowrap"><ReportStatusBadge status={report.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><Link href={`/admin/reports?id=${report.id}`}><Button variant="link" className="text-secondary hover:text-secondary-dark mr-3">View</Button></Link>{report.status === "pending" && (<Button variant="link" className="text-green-600 hover:text-green-800">Process</Button>)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* Mobile Card List */}
                      <div className="space-y-4 md:hidden">
                        {filteredReports.slice(0, 4).map((report) => (
                          <Card key={report.id} className="p-4">
                            <div className="flex items-start gap-4">
                              <img src={report.imageUrl} alt={report.title} className="h-16 w-16 object-cover rounded-md" />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-gray-900">{report.title}</h4>
                                  <ReportStatusBadge status={report.status} />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{report.address.split(",")[0]}</p>
                                <p className="text-xs text-gray-500 mt-2">{formatDate(report.createdAt)}</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                              <Link href={`/admin/reports?id=${report.id}`}><Button size="sm" variant="outline">View Details</Button></Link>
                              {report.status === "pending" && (<Button size="sm">Process</Button>)}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* User Management */}
              <div className="bg-white rounded-lg shadow">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-xl font-bold">User Management</h3>
                  <Link href="/admin/users">
                    <Button variant="link" className="text-primary hover:text-primary-dark font-medium">
                      Manage Users
                    </Button>
                  </Link>
                </div>
                <div className="p-6">
                  {isLoadingUsers ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !users || users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No users yet</h3>
                      <p className="text-gray-500 mt-2">
                        User registrations will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users
                        .filter(u => u.role === "user")
                        .slice(0, 3)
                        .map((user) => {
                          const userReports = reports?.filter(r => r.userId === user.id) || [];
                          
                          return (
                            <div key={user.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"><User className="h-5 w-5" /></div>
                                <div>
                                  <p className="font-medium text-gray-900">{user.fullName}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{userReports.length} reports</p>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{user.isActive ? "Active" : "Inactive"}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;