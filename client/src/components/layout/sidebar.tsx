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
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  UserCheck,
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
    <div className="fixed bottom-4 right-4 md:hidden z-50">
      <Button
        onClick={toggleSidebar}
        size="icon"
        className="h-12 w-12 rounded-full bg-primary text-white shadow-lg"
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
    </div>
  );

  // Determine if link is active
  const isActive = (path: string) => {
    return location === path;
  };

  // Link styling based on active state
  const getLinkStyles = (path: string) => {
    return isActive(path)
      ? "flex items-center px-4 py-3 text-white bg-gray-800"
      : "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white";
  };

  // Admin navigation links
  const adminNavLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
    },
    {
      href: "/admin/reports",
      label: "Waste Reports",
      icon: <Flag className="w-5 h-5 mr-3" />,
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: <Users className="w-5 h-5 mr-3" />,
    },
    {
      href: "/admin/requests",
      label: "Admin Requests",
      icon: <UserCheck className="w-5 h-5 mr-3" />,
    },
    {
      href: "/admin/profile",
      label: "Profile",
      icon: <User className="w-5 h-5 mr-3" />,
    },
  ];

  // User navigation links
  const userNavLinks = [
    {
      href: "/user/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-3" />,
    },
    {
      href: "/user/reports",
      label: "My Reports",
      icon: <Flag className="w-5 h-5 mr-3" />,
    },
    {
      href: "/user/rewards",
      label: "Rewards",
      icon: <BarChart3 className="w-5 h-5 mr-3" />,
    },
    {
      href: "/user/profile",
      label: "Profile",
      icon: <User className="w-5 h-5 mr-3" />,
    },
  ];

  // Choose links based on user role
  const navLinks = isAdmin ? adminNavLinks : userNavLinks;

  // Sidebar content
  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <Link href="/" className="text-primary text-2xl font-bold">
          Clean<span className="text-secondary">City</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
            Main
          </div>
          
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={getLinkStyles(link.href)}>
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase mt-4">
            Account
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-gray-900 text-white hidden md:flex md:flex-col z-50",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-0 bg-black/50 z-50 md:hidden",
          isOpen ? "flex" : "hidden"
        )}
        onClick={() => setIsOpen(false)}
      >
        <div
          className="w-64 bg-gray-900 h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile toggle button */}
      <MobileToggle />
    </>
  );
};

export default Sidebar;