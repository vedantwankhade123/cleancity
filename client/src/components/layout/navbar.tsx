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
import { Menu, X, User, LogOut, Bell, Loader2, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AnimatePresence, motion } from "framer-motion";

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
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const isHomePage = location === "/";

  const navLinks = [
    { href: "/", label: "Home", type: "link", sectionId: "home" },
    { href: "#about", label: "About", type: "button", sectionId: "about" },
    { href: "#how-it-works", label: "How It Works", type: "button", sectionId: "how-it-works" },
    { href: "#rewards", label: "Rewards", type: "button", sectionId: "rewards" },
    { href: "#contact", label: "Contact", type: "button", sectionId: "contact" },
    { href: "/air-quality", label: "Air Quality", type: "link" },
  ];

  useEffect(() => {
    if (!isHomePage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -60% 0px" }
    );

    navLinks.forEach((link) => {
      if (link.sectionId) {
        const element = document.getElementById(link.sectionId);
        if (element) observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [isHomePage]);

  const handleNavigation = (path: string) => {
    setIsMenuOpen(false);
    if (isHomePage) {
      const element = document.querySelector(path);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${path.startsWith('#') ? '' : path}`);
    }
  };

  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json() as Notification[];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleOpenLoginModal = (type: "user" | "admin") => {
    setAuthType(type);
    setShowLoginModal(true);
    setIsMenuOpen(false);
  };

  const handleOpenSignupModal = (type: "user" | "admin") => {
    setAuthType(type);
    setShowSignupModal(true);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const getDashboardLink = () => {
    if (!isAuthenticated) return "/";
    return user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";
  };

  const navbarClass = cn(
    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
    (isHomePage && !scrolled)
      ? "bg-transparent py-4"
      : "bg-white/80 backdrop-blur-lg border-b border-gray-200/80 shadow-sm py-2"
  );

  const floatingLinkClass = (path: string, sectionId?: string) => {
    let isActive = false;
    if (isHomePage) {
      isActive = activeSection === sectionId;
    } else {
      isActive = location === path;
    }
    
    return cn(
      "transition-colors duration-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100",
      isActive && "bg-primary text-white hover:bg-primary/90"
    );
  };

  return (
    <>
      <header className={navbarClass}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold transition-transform hover:scale-105 z-10">
              <span className="text-primary">Clean</span>
              <span className="text-secondary">City</span>
            </Link>

            {/* Centered Navigation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block">
              <nav className="flex items-center space-x-1 transition-all duration-300 bg-white/90 backdrop-blur-md border border-gray-200/90 shadow-sm rounded-full p-1.5">
                {navLinks.map(link => (
                  link.type === 'link' ? (
                    <Link key={link.href} href={link.href} className={floatingLinkClass(link.href, link.sectionId)}>{link.label}</Link>
                  ) : (
                    <button key={link.href} onClick={() => handleNavigation(link.href)} className={floatingLinkClass(link.href, link.sectionId)}>{link.label}</button>
                  )
                ))}
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-2 z-10">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative text-gray-700 hover:bg-gray-100">
                        <Bell className="h-5 w-5" />
                        {notifications && notifications.length > 0 && (
                          <span className="absolute top-1 right-1 bg-accent text-white rounded-full w-4 h-4 text-xs flex items-center justify-center" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <div className="p-2 font-medium">Notifications</div>
                      <DropdownMenuSeparator />
                      <div className="p-2 max-h-60 overflow-y-auto">
                        {isLoadingNotifications ? <div className="flex justify-center p-4"><Loader2 className="h-5 w-5 animate-spin" /></div> :
                         notifications && notifications.length > 0 ? notifications.map(n => (
                           <div key={n.id} className="p-2 rounded-md hover:bg-gray-100 text-sm">
                             <p className="font-medium">{n.message}</p>
                             <p className="text-xs text-gray-500 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                           </div>
                         )) : <div className="text-center text-sm text-gray-500 p-4">No new notifications</div>}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 px-2 text-gray-700 hover:bg-gray-100">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><User className="h-4 w-4" /></div>
                        <span className="text-gray-700">{user?.fullName?.split(" ")[0]}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild><Link href={getDashboardLink()} className="flex items-center w-full cursor-pointer"><LayoutDashboard className="h-4 w-4 mr-2" />Dashboard</Link></DropdownMenuItem>
                      <DropdownMenuItem asChild><Link href={user?.role === "admin" ? "/admin/profile" : "/user/profile"} className="flex items-center w-full cursor-pointer"><User className="h-4 w-4 mr-2" />Profile</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer flex items-center"><LogOut className="h-4 w-4 mr-2" />Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button variant="outline" className="transition-all duration-300 hover:scale-105 border-primary text-primary hover:bg-primary hover:text-white" onClick={() => handleOpenLoginModal("user")}>Login</Button>
                  <Button className="transition-all duration-300 hover:scale-105 bg-primary text-white hover:bg-primary-dark" onClick={() => handleOpenSignupModal("user")}>Sign Up</Button>
                </>
              )}
            </div>

            <div className="md:hidden z-10">
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <Menu className="h-6 w-6 text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <Link href="/" className="text-primary text-2xl font-bold" onClick={toggleMenu}>Clean<span className="text-secondary">City</span></Link>
                  <Button variant="ghost" size="icon" onClick={toggleMenu}><X className="h-6 w-6 text-gray-700" /></Button>
                </div>
                <nav className="flex flex-col space-y-2 text-lg font-medium">
                  {navLinks.map(link => (
                    link.type === 'link' ? (
                      <Link key={link.href} href={link.href} onClick={toggleMenu} className="px-4 py-3 rounded-md hover:bg-gray-100">{link.label}</Link>
                    ) : (
                      <button key={link.href} onClick={() => handleNavigation(link.href)} className="px-4 py-3 rounded-md hover:bg-gray-100 text-left">{link.label}</button>
                    )
                  ))}
                </nav>
                <div className="mt-auto pt-6 border-t space-y-2">
                  {isAuthenticated ? (
                    <>
                      <Button onClick={() => { navigate(getDashboardLink()); setIsMenuOpen(false); }} className="w-full">Dashboard</Button>
                      <Button onClick={handleLogout} variant="outline" className="w-full">Logout</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => handleOpenLoginModal("user")} className="w-full">Login</Button>
                      <Button onClick={() => handleOpenSignupModal("user")} variant="outline" className="w-full">Sign Up</Button>
                      <Button onClick={() => handleOpenLoginModal("admin")} variant="link" className="w-full">Admin Login</Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;