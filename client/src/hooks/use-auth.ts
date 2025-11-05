import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User, Login } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  role: "user" | "admin";
  secretCode?: string;
}

export function useAuth() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch current user data
  const {
    data: user,
    isLoading,
    isError,
    refetch: fetchUser,
  } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    throwOnError: false,
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }
        
        return res.json();
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      console.log("Logging in with:", { email: credentials.email, role: credentials.role });
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      
      if (!res.ok) {
        console.error("Login failed:", res.status, res.statusText);
        const errorText = await res.text();
        throw new Error(errorText || "Login failed");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      console.log("Login successful:", { id: data.id, role: data.role });
      queryClient.setQueryData(["/api/auth/me"], data);
      
      // Invalidate the current user query to force a refetch
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect to appropriate dashboard
      if (data.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/user/dashboard";
      }
    },
    onError: (error: any) => {
      console.error("Login mutation error:", error);
      setError(error.message || "Login failed");
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // If data contains a user object, it was a direct signup
      if (data.id && data.role) {
        queryClient.setQueryData(["/api/auth/me"], data);
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        
        toast({
          title: "Registration Successful",
          description: "Welcome to CleanCity!",
        });

        // Redirect to appropriate dashboard
        if (data.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/user/dashboard";
        }
      } 
      // If data contains a message, it was an admin request
      else if (data.message) {
        toast({
          title: "Request Submitted",
          description: data.message,
        });
      }
    },
    onError: (error: any) => {
      console.error("Registration mutation error:", error);
      setError(error.message || "Registration failed");
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logging out user");
      const res = await apiRequest("POST", "/api/auth/logout", {});
      
      if (!res.ok) {
        console.error("Logout failed:", res.status, res.statusText);
        const errorText = await res.text();
        throw new Error(errorText || "Logout failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      console.log("Logout successful");
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error: any) => {
      console.error("Logout mutation error:", error);
      setError(error.message || "Logout failed");
    },
  });

  // Login function
  const login = useCallback(
    async (credentials: Login) => {
      setError(null);
      try {
        console.log("useAuth: login function called with", { 
          email: credentials.email, 
          role: credentials.role 
        });
        
        const result = await loginMutation.mutateAsync(credentials);
        console.log("useAuth: login mutation completed with result", { 
          id: result?.id, 
          role: result?.role 
        });
        
        return result;
      } catch (error) {
        console.error("useAuth: login error", error);
        throw error;
      }
    },
    [loginMutation]
  );

  // Register function
  const register = useCallback(
    async (userData: RegisterData) => {
      setError(null);
      return registerMutation.mutateAsync(userData);
    },
    [registerMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    setError(null);
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
    login,
    register,
    logout,
    fetchUser,
  };
}