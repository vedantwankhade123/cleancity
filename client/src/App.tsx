import { Switch, Route, useRoute } from "wouter";
import { Suspense, lazy, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/navbar";
import AuthModal from "@/components/dialogs/auth-modal";

// Lazy load components for better performance
const UserDashboard = lazy(() => import("@/pages/user/dashboard"));
const UserReportForm = lazy(() => import("@/pages/user/report-form"));
const UserReports = lazy(() => import("@/pages/user/reports"));
const UserRewards = lazy(() => import("@/pages/user/rewards"));
const UserProfile = lazy(() => import("@/pages/user/profile"));

const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminProfile = lazy(() => import("@/pages/admin/profile"));

function LoadingSpinner() {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
}

function ProtectedRoute({ 
  component: Component, 
  requiredRole = "user", 
  ...rest 
}: { 
  component: React.ComponentType<any>; 
  requiredRole?: "user" | "admin"; 
  [x: string]: any;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  if (requiredRole === "admin" && user?.role !== "admin") {
    window.location.href = "/user/dashboard";
    return null;
  }

  if (requiredRole === "user" && user?.role === "admin") {
    window.location.href = "/admin/dashboard";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  const { fetchUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [authType, setAuthType] = useState<"user" | "admin">("user");
  const [isAdminRoute] = useRoute("/admin/:any*");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className={isAdminRoute ? 'hidden' : ''}>
        <Navbar 
          setShowLoginModal={setShowLoginModal}
          setShowSignupModal={setShowSignupModal}
          setAuthType={setAuthType}
        />
      </div>
      
      <Switch>
        <Route 
          path="/"
          component={() => (
            <Landing 
              setShowLoginModal={setShowLoginModal}
              setShowSignupModal={setShowSignupModal}
              setAuthType={setAuthType}
            />
          )}
        />

        {/* User routes */}
        <Route 
          path="/user/dashboard" 
          component={(props) => <ProtectedRoute component={UserDashboard} requiredRole="user" {...props} />} 
        />
        <Route 
          path="/user/report-new" 
          component={(props) => <ProtectedRoute component={UserReportForm} requiredRole="user" {...props} />} 
        />
        <Route 
          path="/user/reports" 
          component={(props) => <ProtectedRoute component={UserReports} requiredRole="user" {...props} />} 
        />
        <Route 
          path="/user/rewards" 
          component={(props) => <ProtectedRoute component={UserRewards} requiredRole="user" {...props} />} 
        />
        <Route 
          path="/user/profile" 
          component={(props) => <ProtectedRoute component={UserProfile} requiredRole="user" {...props} />} 
        />

        {/* Admin routes */}
        <Route 
          path="/admin/dashboard" 
          component={(props) => <ProtectedRoute component={AdminDashboard} requiredRole="admin" {...props} />} 
        />
        <Route 
          path="/admin/reports" 
          component={(props) => <ProtectedRoute component={AdminReports} requiredRole="admin" {...props} />} 
        />
        <Route 
          path="/admin/users" 
          component={(props) => <ProtectedRoute component={AdminUsers} requiredRole="admin" {...props} />} 
        />
        <Route 
          path="/admin/profile" 
          component={(props) => <ProtectedRoute component={AdminProfile} requiredRole="admin" {...props} />} 
        />

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>

      {/* Auth Modals - Render outside Switch */}
      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        type="login"
        userType={authType}
        onSwitchType={(type) => {
          setShowLoginModal(false);
          setShowSignupModal(true);
          setAuthType(type);
        }}
      />

      <AuthModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        type="signup"
        userType={authType}
        onSwitchType={(type) => {
          setShowSignupModal(false);
          setShowLoginModal(true);
          setAuthType(type);
        }}
      />
    </Suspense>
  );
}

function App() {
  return <Router />;
}

export default App;
