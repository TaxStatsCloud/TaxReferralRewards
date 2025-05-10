import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const [location] = useLocation();
  const { currentUser, isAdmin, logout } = useAuth();
  
  const closeSidebar = () => {
    setOpen(false);
  };
  
  // Function to determine if a link is active
  const isActive = (path: string) => {
    return location === path;
  };
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
      
      <div 
        className={`${
          open ? "fixed inset-y-0 left-0 z-50" : "hidden"
        } md:flex md:flex-shrink-0 md:relative md:z-0`}
      >
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <div className="flex items-center">
                <div className="bg-teal-500 rounded-lg p-2 mr-2">
                  <i className="fas fa-chart-line text-white"></i>
                </div>
                <span className="text-xl font-semibold">ReferMint</span>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <Link 
                href="/dashboard" 
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive("/dashboard") 
                    ? "bg-primary text-white" 
                    : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                }`}
              >
                <i className={`fas fa-home mr-3 ${
                  isActive("/dashboard") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                }`}></i>
                Dashboard
              </Link>
              
              <Link 
                href="/referrals" 
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive("/referrals") 
                    ? "bg-primary text-white" 
                    : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                }`}
              >
                <i className={`fas fa-link mr-3 ${
                  isActive("/referrals") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                }`}></i>
                My Referrals
              </Link>
              
              <Link 
                href="/analytics" 
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive("/analytics") 
                    ? "bg-primary text-white" 
                    : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                }`}
              >
                <i className={`fas fa-chart-bar mr-3 ${
                  isActive("/analytics") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                }`}></i>
                Analytics
              </Link>
              
              <Link 
                href="/rewards" 
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive("/rewards") 
                    ? "bg-primary text-white" 
                    : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                }`}
              >
                <i className={`fas fa-gift mr-3 ${
                  isActive("/rewards") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                }`}></i>
                Rewards
              </Link>
              
              <Link 
                href="/notifications" 
                onClick={closeSidebar}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive("/notifications") 
                    ? "bg-primary text-white" 
                    : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                }`}
              >
                <i className={`fas fa-bell mr-3 ${
                  isActive("/notifications") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                }`}></i>
                Notifications
                <span className="ml-auto inline-block py-0.5 px-2 text-xs font-medium rounded-full bg-primary text-white">
                  0
                </span>
              </Link>
            </nav>
            
            {/* Admin section */}
            {isAdmin && (
              <div className="px-3 mt-6">
                <h3 className="px-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Admin Controls
                </h3>
                <nav className="mt-2 space-y-1">
                  <Link 
                    href="/admin/user-management" 
                    onClick={closeSidebar}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/admin/user-management") 
                        ? "bg-primary text-white" 
                        : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                    }`}
                  >
                    <i className={`fas fa-users-cog mr-3 ${
                      isActive("/admin/user-management") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                    }`}></i>
                    User Management
                  </Link>
                  
                  <Link 
                    href="/admin/approve-rewards" 
                    onClick={closeSidebar}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/admin/approve-rewards") 
                        ? "bg-primary text-white" 
                        : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                    }`}
                  >
                    <i className={`fas fa-tasks mr-3 ${
                      isActive("/admin/approve-rewards") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                    }`}></i>
                    Approve Rewards
                  </Link>
                  
                  <Link 
                    href="/admin/campaigns" 
                    onClick={closeSidebar}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive("/admin/campaigns") 
                        ? "bg-primary text-white" 
                        : "text-neutral-600 hover:bg-gray-50 hover:text-neutral-900"
                    }`}
                  >
                    <i className={`fas fa-bullhorn mr-3 ${
                      isActive("/admin/campaigns") ? "text-white" : "text-neutral-400 group-hover:text-neutral-500"
                    }`}></i>
                    Campaigns
                  </Link>
                </nav>
              </div>
            )}
          </div>
          
          {/* Profile dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="text-sm font-medium">
                  {currentUser?.displayName?.substring(0, 2) || currentUser?.username.substring(0, 2) || "U"}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-700">
                  {currentUser?.displayName || currentUser?.username || "User"}
                </p>
                <p className="text-xs text-neutral-500">
                  {currentUser?.role === "recruiter" ? "Recruiter" : "Candidate"}
                </p>
              </div>
            </div>
            <div className="flex">
              <button 
                onClick={handleLogout}
                className="text-neutral-500 hover:text-neutral-700 mr-3"
                title="Log out"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
              <button className="text-neutral-500 hover:text-neutral-700">
                <i className="fas fa-cog"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
