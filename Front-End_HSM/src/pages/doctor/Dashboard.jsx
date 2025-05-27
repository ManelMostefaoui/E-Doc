import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null); // State to hold dashboard data
  const navigate = useNavigate();

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to login if no token
          navigate('/login');
          return;
        }

        // TODO: Replace with actual API endpoint for doctor dashboard data
        // This is a placeholder. You'll need a backend endpoint that provides data relevant to a doctor's dashboard.
        const response = await axios.get(`${API_BASE_URL}/doctor/dashboard-summary`, {
          headers: {
            'Authorization': `Bearer ${token}'`,
            'Accept': 'application/json',
          },
        });

        console.log('Doctor dashboard data response:', response.data);
        setDashboardData(response.data);

      } catch (err) {
        console.error('Error fetching doctor dashboard data:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0a8a8a] mb-6">Doctor Dashboard</h1>

      {/* TODO: Add content based on dashboardData state */}
      {/* Example: Display summary cards, recent appointments, etc. */}
      {dashboardData ? (
        <div>
          {/* Example: <p>Total Appointments: {dashboardData.totalAppointments}</p> */}
          <p>Dashboard data loaded successfully (check console for details).</p>
           {/* Render specific dashboard components here based on the data */}
        </div>
      ) : (
        <p>No dashboard data available.</p>
      )}

      {/* Example: Add links to other doctor pages */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <ul className="list-disc list-inside">
          <li><a href="/appointments" className="text-[#008080] hover:underline">View Appointments</a></li>
          {/* <li><a href="/patients" className="text-[#008080] hover:underline">View Patients</a></li> */}
           {/* Add other relevant links */}
        </ul>
      </div>

    </div>
  );
} 