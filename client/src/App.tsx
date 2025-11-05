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
const AirQuality = lazy(() => import("@/pages/air-quality"));

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
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: 'login' | 'signup';
  }>({ isOpen: false, type: 'login' });
  const [authType, setAuthType] = useState<"user" | "admin">("user");
  const [isAdminRoute] = useRoute("/admin/:any*");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleOpenModal = (type: 'login' | 'signup', userType: 'user' | 'admin') => {
    setAuthType(userType);
    setAuthModal({ isOpen: true, type });
  };

  const handleCloseModal = () => {
    setAuthModal({ isOpen: false, type: 'login' });
  };

  const handleSwitchModal = (newModalType: 'login' | 'signup', newUserType: 'user' | 'admin') => {
    setAuthType(newUserType);
    setAuthModal({ isOpen: true, type: newModalType });
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className={isAdminRoute ? 'hidden' : ''}>
        <Navbar 
          setShowLoginModal={(show) => handleOpenModal('login', authType)}
          setShowSignupModal={(show) => handleOpenModal('signup', authType)}
          setAuthType={setAuthType}
        />
      </div>
      
      <Switch>
        <Route path="/air-quality">
          <AirQuality 
            setShowLoginModal={(show) => handleOpenModal('login', 'user')}
            setShowSignupModal={(show) => handleOpenModal('signup', 'user')}
            setAuthType={setAuthType}
          />
        </Route>
        
        <Route path="/">
          <Landing 
            setShowLoginModal={(show) => handleOpenModal('login', 'user')}
            setShowSignupModal={(show) => handleOpenModal('signup', 'user')}
            setAuthType={setAuthType}
          />
        </Route>

        {/* User routes */}
        <Route path="/user/dashboard">
          <ProtectedRoute component={UserDashboard} requiredRole="user" />
        </Route>
        <Route path="/user/report-new">
          <ProtectedRoute component={UserReportForm} requiredRole="user" />
        </Route>
        <Route path="/user/reports">
          <ProtectedRoute component={UserReports} requiredRole="user" />
        </Route>
        <Route path="/user/rewards">
          <ProtectedRoute component={UserRewards} requiredRole="user" />
        </Route>
        <Route path="/user/profile">
          <ProtectedRoute component={UserProfile} requiredRole="user" />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/dashboard">
          <ProtectedRoute component={AdminDashboard} requiredRole="admin" />
        </Route>
        <Route path="/admin/reports">
          <ProtectedRoute component={AdminReports} requiredRole="admin" />
        </Route>
        <Route path="/admin/users">
          <ProtectedRoute component={AdminUsers} requiredRole="admin" />
        </Route>
        <Route path="/admin/profile">
          <ProtectedRoute component={AdminProfile} requiredRole="admin" />
        </Route>

        {/* Fallback to 404 */}
        <Route>
          <NotFound />
        </Route>
      </Switch>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseModal}
        type={authModal.type}
        userType={authType}
        onSwitchType={handleSwitchModal}
      />
    </Suspense>
  );
}

function App() {
  return <Router />;
}

export default App;