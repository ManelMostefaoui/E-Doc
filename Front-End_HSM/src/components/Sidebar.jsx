"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import { LogOut, ChevronDown, LayoutDashboard, Users, Settings } from "lucide-react"

export default function Sidebar({ isVisible = true }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside
      className={`${isVisible ? "block" : "hidden"} md:block bg-[#F7F9F9] w-64 border-r border-gray-200 flex-shrink-0 shadow-[2px_2px_12px_rgba(0,0,0,0.25)]`}
    >
      <nav className="p-4 flex flex-col gap-4 ">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 p-2 ${currentPath === "/dashboard" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
        >
          <LayoutDashboard size={20} />
          <span className='font-nunito text-[16px] font-normal text-[#1A1A1A]'>Dashboard</span>
        </Link>
        <Link
          to="/users"
          className={`flex items-center gap-3 p-2 ${currentPath === "/users" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
        >
          <Users size={20} />
          <span className='font-nunito text-[16px] font-normal text-[#1A1A1A]'>Users management</span>
        </Link>
        <div>
          <div
            className={`flex items-center justify-between p-2 ${currentPath.startsWith("/settings") || currentPath === "/admin-settings" ? "text-[#008080]" : ""} hover:bg-[#eef5f5] rounded-md cursor-pointer`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <div className="flex items-center gap-3">
              <Settings size={20} />
              <span className='font-nunito text-[16px] font-normal'>Settings</span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
          </div>
          {isSettingsOpen && (
            <div className="ml-8 mt-2 flex flex-col gap-2">
              <Link
                to="/admin-settings"
                className={`p-2 ${currentPath === "/admin-settings" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                Personal informations
              </Link>
              <Link
                to="/settings/security"
                className={`p-2 ${currentPath === "/settings/security" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                Security
              </Link>
              <Link
                to="/settings/notifications"
                className={`p-2 ${currentPath === "/settings/notifications" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                Notifications
              </Link>
            </div>
          )}
        </div>
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer mt-auto"
        >
          <LogOut size={20} />
          <span className='font-nunito text-[16px] font-normal text-[#1A1A1A]'>Log out</span>
        </div>
      </nav>
    </aside>
  )
}
