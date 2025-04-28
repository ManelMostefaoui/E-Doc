"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { LogOut, ChevronDown, LayoutDashboard, Users, Settings, UserPlus } from "lucide-react"
import axios from "axios"

export default function Sidebar({ isVisible = true }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const API_BASE_URL = 'http://127.0.0.1:8000/api'

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Try to get user info from localStorage first
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user && user.role) {
              setUserRole(user.role.name);
              return;
            }
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
            localStorage.removeItem('user');
          }
        }

        // If we're here, we need to fetch user data from the server
        // First, try to get role information from the authentication token
        // For admin users, we'll use the admin endpoint
        try {
          const response = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.data) {
            // This would mean we're an admin user
            setUserRole('admin');
            // Save to localStorage for future reference
            const userData = { role: { name: 'admin' } };
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (adminErr) {
          // If not an admin, try to determine if a doctor
          // We'll check if they can access the patient endpoint
          try {
            const response = await axios.get(`${API_BASE_URL}/patients`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            if (response.data) {
              // This is likely a doctor
              setUserRole('doctor');
              // Save to localStorage for future reference
              const userData = { role: { name: 'doctor' } };
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (doctorErr) {
            console.error('Failed to determine user role:', doctorErr);
            // If we can't determine the role, we might need to redirect to login
            if (doctorErr.response && (doctorErr.response.status === 401 || doctorErr.response.status === 403)) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        // If auth is invalid, redirect to login
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      }
    };

    fetchUserRole();
  }, [navigate]);

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
        {userRole === 'admin' && (
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 p-2 ${currentPath === "/dashboard" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
          >
            <LayoutDashboard size={20} />
            <span className='font-nunito text-[16px] font-normal'>Dashboard</span>
          </Link>
        )}
        
        {userRole === 'admin' && (
          <Link
            to="/users"
            className={`flex items-center gap-3 p-2 ${currentPath === "/users" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
          >
            <Users size={20} />
            <span className='font-nunito text-[16px] font-normal'>Users management</span>
          </Link>
        )}

        {userRole === 'doctor' && (
          <Link
            to="/patients"
            className={`flex items-center gap-3 p-2 ${currentPath === "/patients" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
          >
            <UserPlus size={20} />
            <span className='font-nunito text-[16px] font-normal'>Patients management</span>
          </Link>
        )}

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
                className={`p-2 ${currentPath === "/admin-settings" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
              >
                Personal informations
              </Link>
              <Link
                to="/settings/security"
                className={`p-2 ${currentPath === "/settings/security" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
              >
                Security
              </Link>
              <Link
                to="/settings/notifications"
                className={`p-2 ${currentPath === "/settings/notifications" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
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
