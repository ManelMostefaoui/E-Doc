"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import axios from "axios"

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("06")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedDay, setSelectedDay] = useState(1)
  const [appointmentRawData, setAppointmentRawData] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [appointmentError, setAppointmentError] = useState(null)

  const [patientStatsRawData, setPatientStatsRawData] = useState(null);
  const [loadingPatientStats, setLoadingPatientStats] = useState(false);
  const [patientStatsError, setPatientStatsError] = useState(null);
  const [roleStatsData, setRoleStatsData] = useState(null);
  const [loadingRoleStats, setLoadingRoleStats] = useState(false);
  const [roleStatsError, setRoleStatsError] = useState(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api'

  useEffect(() => {
    const fetchAppointmentData = async () => {
      setLoadingAppointments(true)
      setAppointmentError(null)
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          // Handle no token case, maybe redirect to login
          return
        }

        const response = await axios.get(`${API_BASE_URL}/consultations/stats/daily`, {
          params: {
            month: selectedMonth,
            year: selectedYear,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })

        console.log('Appointment stats response:', response.data)
        setAppointmentRawData(response.data.data || [])

      } catch (err) {
        console.error('Error fetching appointment stats:', err)
        setAppointmentError('Failed to load appointment statistics.')
      } finally {
        setLoadingAppointments(false)
      }
    }

    fetchAppointmentData()
  }, [selectedMonth, selectedYear])

  // Fetch patient statistics data from the /screening/statistics endpoint
  useEffect(() => {
    const fetchPatientStats = async () => {
      setLoadingPatientStats(true);
      setPatientStatsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Handle no token case
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/screening/statistics`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        console.log('Screening statistics raw response:', response.data); // Log raw response
        setPatientStatsRawData(response.data);

      } catch (err) {
        console.error('Error fetching patient statistics:', err);
        setPatientStatsError('Failed to load patient statistics.');
      } finally {
        setLoadingPatientStats(false);
      }
    };

    fetchPatientStats();
  }, []); // Empty dependency array means this runs once on mount

  // Add new useEffect for fetching role statistics
  useEffect(() => {
    const fetchRoleStats = async () => {
      setLoadingRoleStats(true);
      setRoleStatsError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/admin/user-counts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        console.log('User counts response:', response.data); // Debug log

        // Assuming the response data is an object like { student: 10, teacher: 5, employer: 2 }
        const counts = response.data || {};
        const roleData = Object.keys(counts).map(role => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          value: counts[role] || 0,
        }));

        console.log('Processed user counts data:', roleData); // Debug log
        setRoleStatsData(roleData);

      } catch (err) {
        console.error('Error fetching role statistics:', err);
        setRoleStatsError('Failed to load user statistics.');
      } finally {
        setLoadingRoleStats(false);
      }
    };

    fetchRoleStats();
  }, []); // Empty dependency array means this runs once on mount

  // Generate months and years for dropdowns
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  const years = Array.from({ length: 2220 - 1820 + 1 }, (_, i) => (1820 + i).toString())

  // Calculate days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth), 0).getDate()
  }, [selectedMonth, selectedYear])

  // Generate dynamic appointment data based on selected day and fetched data
  const appointmentData = useMemo(() => {
    const data = []
    // Always show 7 days starting from selectedDay
    const startDay = selectedDay
    const endDay = Math.min(daysInMonth, startDay + 6)

    for (let day = startDay; day <= endDay; day++) {
      // Find data for the current day from the fetched raw data
      const dayData = appointmentRawData.find(item => {
        const itemDay = new Date(item.date).getDate()
        // Also check if the month and year match
        const itemMonth = new Date(item.date).getMonth() + 1 // getMonth() is 0-indexed
        const itemYear = new Date(item.date).getFullYear()
        return itemDay === day && itemMonth === Number.parseInt(selectedMonth) && itemYear === Number.parseInt(selectedYear)
      })

      data.push({
        day: day.toString().padStart(2, "0"),
        scheduled: dayData ? dayData.confirmed : 0,
        canceled: dayData ? dayData.cancelled : 0,
      })
    }
    return data
  }, [selectedDay, daysInMonth, appointmentRawData, selectedMonth, selectedYear])

  // Process fetched patient stats data for the chart
  const patientStatsData = useMemo(() => {
      const processedData = [];
      if (patientStatsRawData && patientStatsRawData.by_category) {
          // Iterate through categories
          for (const category in patientStatsRawData.by_category) {
              if (patientStatsRawData.by_category.hasOwnProperty(category)) {
                  const categoryData = patientStatsRawData.by_category[category];
                  if (categoryData.types) {
                      // Iterate through types within each category
                      for (const type in categoryData.types) {
                          if (categoryData.types.hasOwnProperty(type)) {
                              const typeData = categoryData.types[type];
                              processedData.push({
                                  condition: type, // Use the condition name from the API
                                  total: typeData.total || 0, // Use the total count for the type
                              });
                          }
                      }
                  }
              }
          }
      }
      console.log('Screening statistics processed data for chart:', processedData); // Log processed data
      return processedData;
  }, [patientStatsRawData]); // Depends on the fetched raw data

  // Dynamic patient type data based on role statistics
  const patientTypeData = useMemo(() => {
    if (!roleStatsData || roleStatsData.length === 0) {
      return [
        { name: "No Data", value: 0, color: "#14b8a6" }
      ];
    }

    console.log('Processing role stats data for chart:', roleStatsData); // Debug log

    const colors = ["#14b8a6", "#374151", "#a7f3d0", "#60a5fa", "#f59e0b", "#ef4444"];

    return roleStatsData.map((role, index) => ({
      name: role.name,
      value: role.value,
      color: colors[index % colors.length]
    }));
  }, [roleStatsData]);

  const totalPatients = useMemo(() => {
    return patientTypeData.reduce((sum, item) => sum + item.value, 0);
  }, [patientTypeData]);

  // Calculate today's appointments
  const todayAppointments = useMemo(() => {
    const todayData = appointmentData.find((item) => Number.parseInt(item.day) === selectedDay)
    return todayData ? todayData.scheduled + todayData.canceled : 0
  }, [appointmentData, selectedDay])

  const handlePrevDay = () => {
    setSelectedDay((prev) => Math.max(1, prev - 1)) // Move back by 1 day
  }

  const handleNextDay = () => {
    setSelectedDay((prev) => Math.min(daysInMonth - 6, prev + 1)) // Move forward by 1 day, ensuring we always show 7 days
  }

  // Modified handleDownload function to download as CSV
  const handleDownload = () => {
    if (!patientStatsRawData) {
      console.log("No patient statistics data to download.");
      return;
    }

    const csvRows = [];

    // Add overall statistics (Total Screenings)
    csvRows.push(["Total Screenings", patientStatsRawData.total_screenings || 0]);
    csvRows.push([]); // Add an empty row for separation

    // Add header for category and type details
    const categoryTypeHeader = [
      "Category",
      "Category Total",
      "Category Percentage",
      "Category Male Total",
      "Category Male Percentage",
      "Category Female Total",
      "Category Female Percentage",
      "Condition Type",
      "Condition Type Total",
      "Condition Type Percentage"
    ];
    csvRows.push(categoryTypeHeader);

    // Add data for each category and its types
    if (patientStatsRawData.by_category) {
        for (const category in patientStatsRawData.by_category) {
            if (patientStatsRawData.by_category.hasOwnProperty(category)) {
                const categoryData = patientStatsRawData.by_category[category];
                const maleDistribution = categoryData.gender_distribution?.male || {};
                const femaleDistribution = categoryData.gender_distribution?.female || {};

                if (categoryData.types && Object.keys(categoryData.types).length > 0) {
                    for (const type in categoryData.types) {
                        if (categoryData.types.hasOwnProperty(type)) {
                            const typeData = categoryData.types[type];
                            csvRows.push([
                                // Only include category details on the first row for each category
                                Object.keys(categoryData.types).indexOf(type) === 0 ? category : "",
                                Object.keys(categoryData.types).indexOf(type) === 0 ? (categoryData.total || 0) : "",
                                Object.keys(categoryData.types).indexOf(type) === 0 ? (categoryData.percentage || 0) : "",
                                Object.keys(categoryData.types).indexOf(type) === 0 ? (maleDistribution.total || 0) : "",
                                Object.keys(categoryData.types).indexOf(type) === 0 ? (maleDistribution.percentage || 0) : "",
                                Object.keys(categoryData.types).indexOf(type) === 0 ? (femaleDistribution.total || 0) : "",
                                Object.keys(categoryData.types).indexOf(type) === 0 ? (femaleDistribution.percentage || 0) : "",
                                type, // Condition Type
                                typeData.total || 0, // Condition Type Total
                                typeData.percentage || 0 // Condition Type Percentage
                            ]);
                        }
                    }
                } else {
                     // Handle categories with no specific types listed
                     csvRows.push([
                        category,
                        categoryData.total || 0,
                        categoryData.percentage || 0,
                        maleDistribution.total || 0,
                        maleDistribution.percentage || 0,
                        femaleDistribution.total || 0,
                        femaleDistribution.percentage || 0,
                        "", // No specific type
                        "", // No specific type total
                        "" // No specific type percentage
                     ]);
                }
                csvRows.push([]); // Add empty row after each category for readability
            }
        }
    }


    // Format rows for CSV, handling potential commas and quotes
    const csvString = csvRows.map(row =>
        row.map(cell => {
            // If the cell is a number or empty, return it directly
            if (typeof cell === 'number' || cell === "") {
                return cell;
            }
            // Otherwise, enclose in double quotes and escape existing double quotes
            return `"${cell.replace(/"/g, '""')}"`;
        }).join(",")
    ).join("\n"); // Use \n to represent newline in the string

    // Create a Blob with the CSV data
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a hidden link to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = `patient-statistics-details.csv`; // Use a more descriptive file name
    document.body.appendChild(a);
    a.click();

    // Clean up the URL object and the link
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-teal-600 mb-8">Dashboard :</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Appointments Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Appointments statistics :</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500">/</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-600">Appointments</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevDay}
                    disabled={selectedDay <= 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500">Day {selectedDay}</span>
                  <button
                    onClick={handleNextDay}
                    disabled={selectedDay >= daysInMonth - 6}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {loadingAppointments ? (
                <div className="h-64 flex justify-center items-center text-gray-500">Loading appointments...</div>
              ) : appointmentError ? (
                <div className="h-64 flex justify-center items-center text-red-500">{appointmentError}</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appointmentData} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Bar dataKey="scheduled" fill="#14b8a6" name="Scheduled" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="canceled" fill="#ef4444" name="Canceled" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Canceled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments & Patient Distribution */}
          <div className="space-y-6">
            {/* Today's Appointments Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{todayAppointments} appointments</div>
                    <div className="text-sm text-gray-500">Total today appointments</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Patient Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-700">Total users :</div>
                    <div className="text-2xl font-bold text-gray-900">{totalPatients.toLocaleString()}</div>
                  </div>
                  <div className="w-32 h-32">
                    {loadingRoleStats ? (
                      <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>
                    ) : roleStatsError ? (
                      <div className="h-full flex items-center justify-center text-red-500">{roleStatsError}</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={patientTypeData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={30} 
                            outerRadius={60} 
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {patientTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {patientTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Number of patients by condition</h3> {/* Updated title */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Patient statistics :</span>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {loadingPatientStats ? (
                 <div className="h-80 flex justify-center items-center text-gray-500">Loading patient statistics...</div>
              ) : patientStatsError ? (
                <div className="h-80 flex justify-center items-center text-red-500">{patientStatsError}</div>
              ) : patientStatsData.length === 0 || patientStatsData.every(item => item.total === 0) ? ( // Updated check
                 <div className="h-80 flex justify-center items-center text-gray-500">No patient statistics data available.</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={patientStatsData} barGap={0}>
                      <CartesianGrid strokeDasharray="3 3" />
                      {/* Modified XAxis to decrease font size */}
                      <XAxis
                        dataKey="condition"
                        style={{ fontSize: '12px' }} // Decrease font size
                      />
                      <YAxis />
                      <Bar dataKey="total" fill="#60a5fa" name="Total Patients" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
