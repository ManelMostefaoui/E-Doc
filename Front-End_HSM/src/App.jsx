import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/Login/Login";
import Consultation from "./pages/Consultation";
import Appointements from "./components/Appointements";
import Notifications from "./components/CDoctor/Notifications";

import SettingsPage from "./pages/admin/SettingsSecurity";
import DashboardPage from "./pages/admin/Dashboard";
import UsersManagementPage from "./pages/admin/UsersManagement";
import AdminSettings from "./pages/admin/SettingsPersonalinformations";
import UserDetails from "./pages/admin/UserDetails";

import PatientsManagement from "./pages/doctor/PatientsManagement";
import PatientProfile from "./pages/doctor/PatientProfile";

import ContactCenter from "./pages/patient/ContactCenter"


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Helper to get user role from localStorage
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.role?.name || null;
    } catch {
      return null;
    }
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        
        {/* Redirect root path to login if not logged in, otherwise to dashboard or patients management */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? (
                  getUserRole() === "doctor"
                    ? <Navigate to="/patients" />
                    : <Navigate to="/dashboard" />
                )
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <DashboardPage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <UsersManagementPage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <UserDetails />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/consultation"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <Consultation />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/appointements"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <Appointements />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <SettingsPage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings/security"
          element={
            <PrivateRoute>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <SettingsPage />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings/notifications"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <Notifications />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/admin-settings"
          element={
            <PrivateRoute>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
                    <AdminSettings user={{ firstName: 'Omar', lastName: 'Boudelia' }} />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/patients"
          element={
            <PrivateRoute>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
                    <PatientsManagement />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

          <Route
          path="/patients/:id"
           element={
           <PrivateRoute>
           <div className="h-screen overflow-auto flex flex-col">
           <Navbar />
           <div className="flex flex-1">
          <Sidebar />
           <div className="flex-1 p-4">
            <PatientProfile />
          </div>
        </div>
          </div>
          </PrivateRoute>
           }
          />

          <Route
          path="/contact-center"
           element={
           <PrivateRoute>
           <div className="h-screen overflow-auto flex flex-col">
           <Navbar />
           <div className="flex flex-1">
          <Sidebar />
           <div className="flex-1 p-4">
            <ContactCenter />
          </div>
        </div>
          </div>
          </PrivateRoute>
           }
          />

          


        {/* Redirect to login if not logged in */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
