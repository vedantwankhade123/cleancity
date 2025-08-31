import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface NavbarProps {
  setShowLoginModal: (show: boolean) => void;
  setShowSignupModal: (show: boolean) => void;
  setAuthType: (type: "user" | "admin") => void;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  setShowLoginModal,
  setShowSignupModal,
  setAuthType,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const [currentLocation, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    if (window.location.pathname === '/') {
      // If we're already on the homepage, scroll to the section
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're not on the homepage, navigate to the homepage with the hash
      navigate(`/${path}`);
    }
  };

  // Fetch notifications for authenticated users
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      return data as Notification[];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1,
  });

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleOpenLoginModal = (type: "user" | "admin") => {
    setAuthType(type);
    setShowLoginModal(true);
  };

  const handleOpenSignupModal = (type: "user" | "admin") => {
    setAuthType(type);
    setShowSignupModal(true);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const navbarClass = cn(
    "fixed top-0 z-50 transition-all duration-300 mt-5 left-[20px] right-[20px]",
    "rounded-[40px] overflow-hidden",
    window.location.pathname === '/' && !scrolled
      ? "bg-transparent"
      : "bg-white/95 backdrop-blur-sm shadow-sm",
    scrolled && "py-2"
  );

  const linkClass = cn(
    "relative transition-colors duration-200",
    window.location.pathname === '/' && !scrolled
      ? "font-bold text-white hover:text-gray-200"
      : "font-medium text-gray-700 hover:text-primary",
    "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-full"
  );

  // Dashboard navigation links based on user role
  const getDashboardLink = () => {
    if (!isAuthenticated) return "/";
    return user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
  };

  return (
    <header className={navbarClass}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-primary text-2xl font-bold transition-transform hover:scale-105">
              Clean<span className="text-secondary">City</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className={linkClass}>
              Home
            </Link>
            <button 
              onClick={() => handleNavigation('#about')} 
              className={linkClass}
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('#how-it-works')} 
              className={linkClass}
            >
              How It Works
            </button>
            <button 
              onClick={() => handleNavigation('#rewards')} 
              className={linkClass}
            >
              Rewards
            </button>
            <button 
              onClick={() => handleNavigation('#contact')} 
              className={linkClass}
            >
              Contact
            </button>
            <Link href="/air-quality" className={linkClass}>
              Air Quality
            </Link>
          </nav>

          {/* Auth buttons or user menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Notification bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "relative transition-colors",
                        window.location.pathname === '/' && !scrolled
                          ? "text-white hover:bg-white/20"
                          : "text-gray-700 hover:bg-primary/10"
                      )}
                    >
                      <Bell className="h-5 w-5" />
                      {/* Notification count badge */}
                      {isAuthenticated && notifications && notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-white rounded-full w-4 h-4 text-xs flex items-center justify-center animate-pulse">
                          {notifications.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="py-2 px-4 font-medium text-sm">Notifications</div>
                    <DropdownMenuSeparator />
                    <div className="px-4 py-2 text-sm space-y-3 max-h-60 overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-muted-foreground text-xs mt-1">{notification.timestamp ? new Date(notification.timestamp).toLocaleString() : 'Just now'}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500">No new notifications</div>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-primary font-medium hover:bg-primary/10">
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-2 px-2 transition-colors",
                         window.location.pathname === '/' && !scrolled
                          ? "text-white hover:bg-white/20"
                          : "text-gray-700 hover:bg-primary/10"
                      )}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {user?.fullName?.split(" ")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <Link href={getDashboardLink()}>
                      <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
                        Dashboard
                      </DropdownMenuItem>
                    </Link>
                    <Link
                      href={
                        user?.role === "admin"
                          ? "/admin/profile"
                          : "/user/profile"
                      }
                    >
                      <DropdownMenuItem className="cursor-pointer hover:bg-primary/10">
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  className={cn(
                    "transition-colors",
                    window.location.pathname === '/' && !scrolled
                          ? "bg-white border-primary text-primary hover:bg-primary hover:text-white"
                          : "border-primary text-primary hover:bg-primary hover:text-white"
                  )}
                  onClick={() => handleOpenLoginModal("user")}
                >
                  Login
                </Button>
                <Button
                  variant="default"
                  className={cn(
                     "transition-colors",
                    window.location.pathname === '/' && !scrolled
                          ? "bg-white text-primary hover:bg-primary hover:text-white"
                          : "bg-primary text-white hover:bg-primary-dark"
                  )}
                  onClick={() => handleOpenSignupModal("user")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className={cn(
                "transition-colors",
                window.location.pathname === '/' && !scrolled ? "text-white" : "text-gray-700"
              )}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "md:hidden bg-white shadow-lg transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pt-2 pb-3 space-y-1">
          <Link 
            href="/" 
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Home
          </Link>
          <button 
            onClick={() => handleNavigation('#about')}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => handleNavigation('#how-it-works')}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleNavigation('#rewards')}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Rewards
          </button>
          <button 
            onClick={() => handleNavigation('#contact')}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Contact
          </button>
          <Link 
            href="/air-quality" 
            onClick={() => setIsMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Air Quality
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                href={getDashboardLink()} 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href={
                  user?.role === "admin"
                    ? "/admin/profile"
                    : "/user/profile"
                }
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  handleOpenLoginModal("user");
                  toggleMenu();
                }}
                className="w-full px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  handleOpenSignupModal("user");
                  toggleMenu();
                }}
                className="w-full px-3 py-2 rounded-md text-base font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  handleOpenLoginModal("admin");
                  toggleMenu();
                }}
                className="w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Admin Login
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
