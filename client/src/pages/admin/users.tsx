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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Loader2,
  Filter,
  MoreVertical,
  User,
  UserPlus,
  Flag,
  Coins,
  RefreshCw,
  AlertTriangle,
  Trash,
  Edit,
} from "lucide-react";
import { User as UserType, Report } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Helmet } from "react-helmet";

// Form validation schema
const userEditSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().min(5, "Pincode must be at least 5 characters"),
  isActive: z.boolean(),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

// Add new user form schema (only for user role)
const newUserSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
});

type NewUserFormValues = z.infer<typeof newUserSchema>;

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");

  // Get user ID from URL if present
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const userIdParam = searchParams.get("id");

  // Fetch all users
  const { 
    data: users, 
    isLoading: isLoadingUsers, 
    isError: isErrorUsers,
    error: errorUsers
  } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all reports to count by user
  const { 
    data: reports, 
    isLoading: isLoadingReports
  } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize form
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      isActive: true,
    },
  });

  // Add user form setup
  const addUserForm = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  // Find user by ID from URL param
  useEffect(() => {
    if (userIdParam && users) {
      const user = users.find(u => u.id === parseInt(userIdParam));
      if (user) {
        handleEditUser(user);
      }
    }
  }, [userIdParam, users]);

  // Load selected user data into form
  useEffect(() => {
    if (selectedUser && isEditDialogOpen) {
      form.reset({
        fullName: selectedUser.fullName,
        phone: selectedUser.phone,
        address: selectedUser.address,
        city: selectedUser.city,
        state: selectedUser.state,
        pincode: selectedUser.pincode,
        isActive: selectedUser.isActive,
      });
    }
  }, [selectedUser, isEditDialogOpen, form]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: UserEditFormValues }) => {
      const response = await apiRequest("PATCH", `/api/users/${userId}`, userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User information has been updated.",
      });
      // Remove the user ID from URL
      setLocation("/admin/users");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user information.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("DELETE", `/api/users/${userId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User has been deleted.",
      });
      // Remove the user ID from URL
      setLocation("/admin/users");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding a new user
  const addUserMutation = useMutation({
    mutationFn: async (values: NewUserFormValues) => {
      const response = await apiRequest("POST", "/api/users", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddUserDialogOpen(false);
      addUserForm.reset();
      toast({
        title: "Success",
        description: "New user has been added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add new user.",
        variant: "destructive",
      });
    },
  });

  // Handle edit user
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: UserEditFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ userId: selectedUser.id, userData: values });
    }
  };

  // Handle add user form submission
  const onAddUserSubmit = (values: NewUserFormValues) => {
    addUserMutation.mutate(values);
  };

  // Filter and sort users
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    
    // First filter by search query and status
    let filtered = users.filter(user => {
      // Skip admins, only show regular users
      if (user.role === "admin") return false;
      
      // Filter by status
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && user.isActive) || 
        (statusFilter === "inactive" && !user.isActive);
      
      // Filter by search query
      const matchesSearch = !searchQuery || 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
    
    // Then sort the filtered users
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fullName.localeCompare(b.fullName);
        case "email":
          return a.email.localeCompare(b.email);
        case "city":
          return a.city.localeCompare(b.city);
        case "status":
          return (a.isActive === b.isActive) ? 0 : a.isActive ? -1 : 1;
        default:
          return 0;
      }
    });
  }, [users, searchQuery, statusFilter, sortBy]);

  // Count reports by user ID
  const getUserReportsCount = (userId: number) => {
    if (!reports) return { total: 0, completed: 0 };
    
    const userReports = reports.filter(report => report.userId === userId);
    const completedReports = userReports.filter(report => report.status === "completed");
    
    return {
      total: userReports.length,
      completed: completedReports.length
    };
  };

  const isLoading = isLoadingUsers || isLoadingReports;

  return (
    <>
      <Helmet>
        <title>Manage Users | CleanCity Admin</title>
        <meta name="description" content="Manage user accounts, edit user information, or deactivate accounts if necessary." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1 md:ml-64">
          {/* Admin Dashboard Header */}
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => setIsAddUserDialogOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden md:inline">Add User</span>
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Users Management */}
          <main className="container px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Manage Users</CardTitle>
                    <CardDescription>
                      View and manage user accounts in your city
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search users..."
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
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : isErrorUsers ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-md">
                    Error loading users: {(errorUsers as Error).message}
                  </div>
                ) : !users || filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No users found</h3>
                    <p className="text-gray-500 mt-2">
                      {searchQuery || statusFilter !== "all" 
                        ? "Try changing your search or filter" 
                        : "There are no users in your city yet"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                            onClick={() => setSortBy("name")}
                          >
                            User
                            {sortBy === "name" && <span className="ml-1">↓</span>}
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                            onClick={() => setSortBy("city")}
                          >
                            Location
                            {sortBy === "city" && <span className="ml-1">↓</span>}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reports
                          </th>
                          <th 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                            onClick={() => setSortBy("status")}
                          >
                            Status
                            {sortBy === "status" && <span className="ml-1">↓</span>}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => {
                          const { total: reportCount, completed: completedCount } = getUserReportsCount(user.id);
                          
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                    <User className="h-5 w-5" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.fullName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {user.city}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.state}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {reportCount} reports
                                </div>
                                <div className="text-sm text-gray-500">
                                  {completedCount} completed
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="hover:bg-gray-100 rounded-full p-2"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent 
                                    align="end" 
                                    className="w-56 p-1.5 bg-white rounded-xl shadow-lg border border-gray-200"
                                    sideOffset={8}
                                  >
                                    <DropdownMenuItem 
                                      onClick={() => handleEditUser(user)}
                                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <Edit className="h-4 w-4 text-gray-500" />
                                      <span>Edit User</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteUser(user)}
                                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <Trash className="h-4 w-4 text-red-500" />
                                      <span>Delete User</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
          
          {/* Add User Dialog */}
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account.</DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                <Form {...addUserForm}>
                  <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4">
                    <FormField
                      control={addUserForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addUserForm.control}
                      name="pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pincode (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={addUserMutation.isPending}>
                      {addUserMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding user...
                        </>
                      ) : (
                        "Add User"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Edit User Dialog */}
          {selectedUser && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit User</DialogTitle>
                  <DialogDescription>
                    Update user information and account status
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Account Status
                            </FormLabel>
                            <FormDescription>
                              {field.value ? "User account is active" : "User account is disabled"}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!form.formState.isDirty || updateUserMutation.isPending}
                      >
                        {updateUserMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Delete User Confirmation Dialog */}
          {selectedUser && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user
                    account and all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteUserMutation.mutate(selectedUser.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteUserMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete User"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
