import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import SettingsPage from "./pages/SettingsSecurity";
import DashboardPage from "./pages/Dashboard";
import UsersManagementPage from "./pages/UsersManagement";
import AdminSettings from "./pages/SettingsPersonalinformations";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import UserDetails from "./pages/UserDetails";
import LoginPage from "./pages/Login/Login";
import Consultation from "./pages/Consultation";
import Appointements from "./components/Appointements";
import Notifications from "./components/Notifications";
import Medications from "./components/Medications";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <DashboardPage />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/dashboard"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <DashboardPage />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/users"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <UsersManagementPage />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/users/:id"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <UserDetails />
                  </div>
                </div>
              </div>
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
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <SettingsPage />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/settings/security"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <SettingsPage />
                  </div>
                </div>
              </div>
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
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1">
                    <AdminSettings user={{ firstName: 'Omar', lastName: 'Boudelia' }} />
                  </div>
                </div>
              </div>
          }
        />

        <Route
          path="/medications"
          element={
              <div className="h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 h-0">
                  <Sidebar />
                  <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <Medications />
                  </div>
                </div>
              </div>
          }
        />

        {/* Redirect to login if not logged in */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
