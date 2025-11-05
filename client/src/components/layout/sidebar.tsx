import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Flag,
  Users,
  User,
  LogOut,
  Menu,
  X,
  UserCheck,
  Shield,
  BarChart3,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // Mobile sidebar toggle button
  const MobileToggle = () => (
    <div className="fixed bottom-4 right-4 md:hidden z-[60]">
      <Button
        onClick={toggleSidebar}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );

  // Determine if link is active
  const isActive = (path: string) => {
    return location === path;
  };

  // Link styling based on active state
  const getLinkStyles = (path: string) => {
    return cn(
      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200",
      isActive(path)
        ? "bg-primary/10 text-primary"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    );
  };

  // Admin navigation links
  const adminNavLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reports", label: "Waste Reports", icon: Flag },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/requests", label: "Admin Requests", icon: UserCheck },
  ];

  // User navigation links
  const userNavLinks = [
    { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/user/reports", label: "My Reports", icon: Flag },
    { href: "/user/rewards", label: "Rewards", icon: BarChart3 },
  ];

  const navLinks = isAdmin ? adminNavLinks : userNavLinks;
  const profileLink = isAdmin ? "/admin/profile" : "/user/profile";

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-center h-20 shrink-0 px-4 border-b border-gray-800">
        <Link href="/" className="text-2xl font-bold transition-transform hover:scale-105">
          <span className="text-primary">Clean</span>
          <span className="text-secondary">City</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-grow">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={getLinkStyles(link.href)}>
              <link.icon className="w-5 h-5 mr-3" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer / User Profile */}
      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="space-y-4">
          <Link href={profileLink} className={getLinkStyles(profileLink)}>
            <User className="w-5 h-5 mr-3" />
            <span>Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-md text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
        <div className="flex items-center gap-3 mt-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed top-[5px] bottom-[5px] left-[5px] w-64 bg-gray-900 text-white hidden md:flex md:flex-col z-50 rounded-xl shadow-lg overflow-hidden",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 z-[55] md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Mobile sidebar panel */}
      <aside
        className={cn(
          "fixed top-[5px] bottom-[5px] left-0 w-64 bg-gray-900 text-white flex flex-col z-[60] md:hidden transition-transform duration-300 ease-in-out rounded-xl shadow-lg overflow-hidden",
          isOpen ? "translate-x-[5px]" : "-translate-x-full",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <MobileToggle />
    </>
  );
};

export default Sidebar;