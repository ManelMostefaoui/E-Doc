import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/Login/Login";
import Consultation from "./pages/Consultation";
import Appointements from "./components/Appointements";
import Notifications from "./components/Notifications";

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

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        
        {/* Redirect root path to login if not logged in, otherwise to dashboard */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
                    <Consultation />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/appointements"
          element={
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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
              <div className="h-screen overflow-auto flex flex-col">
                {/* Navbar */}
                <Navbar />

                {/* Sidebar + Page content */}
                <div className=" flex flex-1">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Main content */}
                  <div className=" flex-1 p-4">
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
