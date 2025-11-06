import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Save, User, AlertTriangle, Check, Shield, Loader2, Lock } from "lucide-react";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";

// Form validation schema
const profileFormSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().min(5, "Pincode must be at least 5 characters"),
});

// Password change schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const AdminProfile: React.FC = () => {
  const { user, fetchUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState("profile");
  
  // Profile form setup
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      pincode: user?.pincode || "",
    },
  });
  
  // Password form setup
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update form values when user data changes
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      });
    }
  }, [user, profileForm]);
  
  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      fetchUser();
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  // Password update mutation
  const passwordUpdateMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${user.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    profileUpdateMutation.mutate(values);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (values: PasswordFormValues) => {
    passwordUpdateMutation.mutate(values);
  };

  const navLinks = [
    { id: 'profile', label: 'Profile', icon: Shield },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Profile | CleanCity</title>
        <meta name="description" content="Manage your admin profile and account settings for CleanCity waste management platform." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        
        <div className="flex-1 md:ml-[calc(16rem+10px)]">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              </div>
            </div>
          </header>

          <main className="container px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Admin Account Settings</h2>
              <p className="text-gray-600 mt-1">Manage your admin profile and security preferences.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <aside className="lg:col-span-1">
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                        activeTab === link.id
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <link.icon className="mr-3 h-5 w-5" />
                      <span>{link.label}</span>
                    </button>
                  ))}
                </nav>
              </aside>

              <div className="lg:col-span-3">
                {activeTab === 'profile' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Admin Profile</CardTitle>
                      <CardDescription>Update your administrator information.</CardDescription>
                    </CardHeader>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                        <CardContent className="space-y-8">
                          {/* Full Name */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">Full Name</h3>
                              <p className="text-sm text-gray-500">Your public display name.</p>
                            </div>
                            <div className="md:col-span-2">
                              <FormField control={profileForm.control} name="fullName" render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          </div>

                          <hr />

                          {/* Email */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">Email</h3>
                              <p className="text-sm text-gray-500">Your email address cannot be changed.</p>
                            </div>
                            <div className="md:col-span-2">
                              <FormItem>
                                <FormControl><Input value={user?.email || ''} disabled /></FormControl>
                              </FormItem>
                            </div>
                          </div>

                          <hr />

                          {/* Phone */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">Phone Number</h3>
                              <p className="text-sm text-gray-500">Your primary contact number.</p>
                            </div>
                            <div className="md:col-span-2">
                              <FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          </div>

                          <hr />

                          {/* Address */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">Address</h3>
                              <p className="text-sm text-gray-500">Your primary address.</p>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                              <FormField control={profileForm.control} name="address" render={({ field }) => (<FormItem><FormControl><Input placeholder="Street Address" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormField control={profileForm.control} name="city" render={({ field }) => (<FormItem><FormControl><Input placeholder="City" {...field} readOnly className="bg-gray-100" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={profileForm.control} name="state" render={({ field }) => (<FormItem><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={profileForm.control} name="pincode" render={({ field }) => (<FormItem><FormControl><Input placeholder="Pincode" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-6">
                          <Button type="submit" disabled={!profileForm.formState.isDirty || profileUpdateMutation.isPending} className="gap-2">
                            {profileUpdateMutation.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4" />Save Changes</>)}
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </Card>
                )}

                {activeTab === 'password' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>Update your password to keep your account secure.</CardDescription>
                    </CardHeader>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                        <CardContent className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">Current Password</h3>
                              <p className="text-sm text-gray-500">Enter your current password.</p>
                            </div>
                            <div className="md:col-span-2">
                              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<FormItem><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          </div>

                          <hr />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">New Password</h3>
                              <p className="text-sm text-gray-500">Enter your new password.</p>
                            </div>
                            <div className="md:col-span-2">
                              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          </div>

                          <hr />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div className="md:col-span-1">
                              <h3 className="font-medium">Confirm New Password</h3>
                              <p className="text-sm text-gray-500">Re-enter your new password.</p>
                            </div>
                            <div className="md:col-span-2">
                              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t pt-6">
                          <Button type="submit" variant="default" disabled={passwordUpdateMutation.isPending} className="gap-2">
                            {passwordUpdateMutation.isPending ? (<><Loader2 className="h-4 w-4 animate-spin" />Updating...</>) : (<><Check className="h-4 w-4" />Update Password</>)}
                          </Button>
                        </CardFooter>
                      </form>
                    </Form>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;