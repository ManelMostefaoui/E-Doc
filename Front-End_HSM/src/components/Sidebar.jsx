"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { LogOut, ChevronDown, LayoutDashboard, Users, Settings, UserPlus, Stethoscope, Calendar, User, Shield, Bell } from "lucide-react"
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

        try {
          const response = await axios.get(`${API_BASE_URL}/admin/users`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });

          if (response.data) {
            setUserRole('admin');
            const userData = { role: { name: 'admin' } };
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (adminErr) {
          try {
            const response = await axios.get(`${API_BASE_URL}/patients`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });

            if (response.data) {
              setUserRole('doctor');
              const userData = { role: { name: 'doctor' } };
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (doctorErr) {
            console.error('Failed to determine user role:', doctorErr);
            try {
              const response = await axios.get(`${API_BASE_URL}/patients/me`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json'
                }
              });

              if (response.data) {
                setUserRole('patient');
                const userData = { role: { name: 'patient' } };
                localStorage.setItem('user', JSON.stringify(userData));
              }
            } catch (patientErr) {
              console.error('Failed to determine if user is a patient:', patientErr);
              if (patientErr.response && (patientErr.response.status === 401 || patientErr.response.status === 403)) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
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
            className={`flex items-center gap-3 p-3 ${currentPath === "/dashboard" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
          >
            <LayoutDashboard size={20} />
            <span className='font-nunito text-[16px] font-normal '>Dashboard</span>
          </Link>
        )}
        {userRole === 'doctor' && (
          <>
            <Link
              to="/consultation"
              className={`flex items-center gap-3 p-3 ${currentPath === "/consultation" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
            >
              <Stethoscope size={20} />
              <span className='font-nunito text-[16px] font-normal '>Consultation</span>
            </Link>
            <Link
              to="/Appointements"
              className={`flex items-center gap-3 p-3 ${currentPath === "/Appointements" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
            >
              <Calendar size={20} />
              <span className='font-nunito text-[16px] font-normal '>Appointements</span>
            </Link>
          </>
        )}
<<<<<<< HEAD

=======
>>>>>>> 465f626 (bon)
        {userRole === 'admin' && (
          <Link
            to="/users"
            className={`flex items-center gap-3 p-3 ${currentPath === "/users" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
          >
            <Users size={20} />
            <span className='font-nunito text-[16px] font-normal'>Users management</span>
          </Link>
        )}

        {userRole === 'doctor' && (
          <Link
            to="/patients"
            className={`flex items-center gap-3 p-3 ${currentPath === "/patients" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
          >
            <UserPlus size={20} />
            <span className='font-nunito text-[16px] font-normal'>Patients management</span>
          </Link>
        )}

       {userRole === 'teacher' && (
        <Link
        to="/contact-center"
         className={`flex items-center gap-3 p-3 ${currentPath === "/contact-center" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5] text-[#1A1A1A]"} rounded-md cursor-pointer`}
         >
        <Users size={20} />
          <span className='font-nunito text-[16px] font-normal'>Contact Center</span>
        </Link>
        )}

        <div>
          <div
            className={`flex items-center justify-between p-3 ${currentPath.startsWith("/settings") || currentPath === "/admin-settings" ? "text-[#008080]" : ""} hover:bg-[#eef5f5] rounded-md cursor-pointer`}
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
              <Link
                to="/admin-settings"
                className={`flex items-center gap-2 p-3 ${currentPath === "/admin-settings" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                <User size={18} />
                <span className='font-nunito text-[16px] font-normal'>Personal informations</span>
              </Link>
              <Link
                to="/settings/security"
                className={`flex items-center gap-2 p-3 ${currentPath === "/settings/security" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                <Shield size={18} />
                <span className='font-nunito text-[16px] font-normal'>Security</span>
              </Link>
              <Link
                to="/settings/notifications"
                className={`flex items-center gap-2 p-3 ${currentPath === "/settings/notifications" ? "bg-[#008080] text-white" : "hover:bg-[#eef5f5]"} rounded-md cursor-pointer`}
              >
                <Bell size={18} />
                <span className='font-nunito text-[16px] font-normal'>Notifications</span>
              </Link>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 hover:bg-[#eef5f5] rounded-md cursor-pointer"
          >
            <LogOut size={20} />
            <span className='font-nunito text-[16px] font-normal'>Log out</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}
