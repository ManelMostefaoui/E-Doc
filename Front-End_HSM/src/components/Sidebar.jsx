"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { LogOut, ChevronDown, LayoutDashboard, Users, Settings, UserPlus, Stethoscope, Calendar, User, Shield, Bell, Pill } from "lucide-react"
import axios from "axios"

export default function Sidebar({ isVisible = true }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const API_BASE_URL = 'http://127.0.0.1:8000/api'
  const contactCenterRoles = ['student', 'teacher', 'employer'];

  useEffect(() => {
    const updateUserRole = async () => {
      const userData = localStorage.getItem('user');
      let role = null;

      if (userData) {
        try {
          const user = JSON.parse(userData);
          role = typeof user?.role === 'string' ? user.role : user?.role?.name;
          console.log('Sidebar userRole from localStorage:', role);
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
          localStorage.removeItem('user');
        }
      }

      if (!role) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await axios.get(`${API_BASE_URL}/user`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            const apiUser = response.data;
            role = typeof apiUser.role === 'string' ? apiUser.role : apiUser.role?.name;
            console.log('Sidebar userRole from API:', role);
            localStorage.setItem('user', JSON.stringify(apiUser));
          } catch (err) {
            console.error('Error fetching user role from API:', err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }
          }
        } else {
          navigate('/login');
        }
      }

      setUserRole(role);
    };

    updateUserRole();
    window.addEventListener('userChanged', updateUserRole);
    return () => window.removeEventListener('userChanged', updateUserRole);
  }, [navigate, location, API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside
      className={`${isVisible ? "block" : "hidden"} md:block bg-[#F7F9F9] w-64 border-r border-gray-200 flex-shrink-0 shadow-[2px_2px_12px_rgba(0,0,0,0.25)] flex flex-col h-full relative`}
    >
      <nav className="p-4 flex flex-col gap-4 overflow-y-auto pb-16">
        {contactCenterRoles.includes(userRole) ? (
          <Link
            to="/contact-center"
            className={`flex items-center gap-3 p-3 ${currentPath === "/contact-center" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
          >
            <Users size={20} />
            <span className='font-nunito text-[16px] font-normal'>Contact Center</span>
          </Link>
        ) : (
          <>
            {userRole === 'admin' && (
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 p-3 ${currentPath === "/dashboard" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                <LayoutDashboard size={20} />
                <span className='font-nunito text-[16px] font-normal '>Dashboard</span>
              </Link>
            )}

            {userRole === 'doctor' && (
              <>
                <Link
                  to="/patients"
                  className={`flex items-center gap-3 p-3 ${currentPath === "/patients" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
                >
                  <UserPlus size={20} />
                  <span className='font-nunito text-[16px] font-normal'>Patients management</span>
                </Link>
                <Link
                  to="/Appointements"
                  className={`flex items-center gap-3 p-3 ${currentPath === "/Appointements" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
                >
                  <Calendar size={20} />
                  <span className='font-nunito text-[16px] font-normal '>Appointements</span>
                </Link>
                <Link
                  to="/consultation"
                  className={`flex items-center gap-3 p-3 ${currentPath === "/consultation" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
                >
                  <Stethoscope size={20} />
                  <span className='font-nunito text-[16px] font-normal '>Consultation</span>
                </Link>
                <Link
                  to="/medications"
                  className={`flex items-center gap-3 p-3 ${currentPath === "/medications" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
                >
                  <Pill size={20} />
                  <span className='font-nunito text-[16px] font-normal '>Medications</span>
                </Link>
              </>
            )}

            {userRole === 'admin' && (
              <Link
                to="/users"
                className={`flex items-center gap-3 p-3 ${currentPath === "/users" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
              >
                <Users size={20} />
                <span className='font-nunito text-[16px] font-normal'>Users management</span>
              </Link>
            )}
          </>
        )}

        {/* Settings section - always visible for all authenticated users */}
        {userRole && (
          <div>
            <div
              className={`flex items-center justify-between p-3 ${currentPath.startsWith("/settings") ? "text-[#008080]" : ""} hover:bg-[#eef5f5] rounded-md cursor-pointer`}
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            >
              <div className="flex items-center gap-3">
                <Settings size={20} />
                <span className='font-nunito text-[16px] font-normal'>Settings</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
            </div>
            {isSettingsOpen && (
              <div className="mt-2 flex flex-col gap-2">
                {/* Personal Information - available for all users */}
                <Link
                  to="/settings/personal"
                  className={`flex items-center gap-2 p-3 ${currentPath === "/settings/personal" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
                >
                  <User size={18} />
                  <span className='font-nunito text-[16px] font-normal'>Personal Information</span>
                </Link>

                {/* Security - available for all users */}
                <Link
                  to="/settings/security"
                  className={`flex items-center gap-2 p-3 ${currentPath === "/settings/security" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
                >
                  <Shield size={18} />
                  <span className='font-nunito text-[16px] font-normal'>Security</span>
                </Link>

                {/* Notifications - only visible for doctors */}
                {userRole === 'doctor' && (
                  <Link
                    to="/settings/notifications"
                    className={`flex items-center gap-2 p-3 ${currentPath === "/settings/notifications" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
                  >
                    <Bell size={18} />
                    <span className='font-nunito text-[16px] font-normal'>Notifications</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="absolute bottom-0 left-0 w-full p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 hover:bg-[#eef5f5] rounded-md cursor-pointer"
        >
          <LogOut size={20} />
          <span className='font-nunito text-[16px] font-normal'>Log out</span>
        </button>
      </div>
    </aside>
  )
}