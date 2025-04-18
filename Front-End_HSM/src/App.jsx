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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Redirect root path to login if not logged in, otherwise to dashboard */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

        <Route
          path="/dashboard"
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

        {/* Redirect to login if not logged in */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
