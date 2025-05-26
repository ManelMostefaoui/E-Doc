import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/Login/Login";
import Consultation from "./pages/Consultation";
import Appointements from "./pages/doctor/Appointements";
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
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  // Helper to get user role from localStorage
  const getUserRole = () => {
    if (user) {
      return typeof user.role === 'string' ? user.role : user.role?.name || null;
    }
    try {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      return typeof userFromStorage?.role === 'string' ? userFromStorage.role : userFromStorage?.role?.name || null;
    } catch {
      return null;
    }
  };

  const PrivateRoute = ({ children, allowedRoles = [] }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" />;
    }

    // Si des rôles sont spécifiés, vérifier si l'utilisateur a le bon rôle
    if (allowedRoles.length > 0) {
      const userRole = getUserRole();
      console.log('PrivateRoute userRole:', userRole, 'allowedRoles:', allowedRoles);
      if (!allowedRoles.includes(userRole)) {
        // Rediriger vers une page appropriée selon le rôle
        return userRole === 'admin' ? <Navigate to="/dashboard" /> :
          userRole === 'doctor' ? <Navigate to="/patients" /> :
            <Navigate to="/login" />;
      }
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} setUser={setUser} />} />

        {/* Redirect root path to login if not logged in, otherwise to dashboard or patients management */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? (
                ['student', 'teacher', 'employer'].includes(getUserRole())
                  ? <Navigate to="/contact-center" />
                  : getUserRole() === "doctor"
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
          path="/settings/personal"
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
                    <AdminSettings />
                  </div>
                </div>
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/settings/notifications"
          element={
            <PrivateRoute allowedRoles={['doctor']}>
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
            </PrivateRoute>
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
            <PrivateRoute allowedRoles={['student', 'teacher', 'employer']}>
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
