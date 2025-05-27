"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("06")
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedDay, setSelectedDay] = useState(1)

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

  // Generate dynamic appointment data based on selected day
  const appointmentData = useMemo(() => {
    const data = []
    const startDay = Math.max(1, selectedDay - 3)
    const endDay = Math.min(daysInMonth, selectedDay + 3)

    for (let day = startDay; day <= endDay; day++) {
      data.push({
        day: day.toString().padStart(2, "0"),
        scheduled: Math.floor(Math.random() * 15) + 5,
        canceled: Math.floor(Math.random() * 8) + 2,
      })
    }
    return data
  }, [selectedDay, daysInMonth])

  // Dynamic patient type data
  const patientTypeData = [
    { name: "Students", value: 9256, color: "#14b8a6" },
    { name: "Teachers", value: 756, color: "#374151" },
    { name: "Employers", value: 241, color: "#a7f3d0" },
  ]

  const totalPatients = patientTypeData.reduce((sum, item) => sum + item.value, 0)

  // Dynamic patient statistics data
  const patientStatsData = [
    { condition: "Asthma", boys: 12, girls: 6 },
    { condition: "Allergy", boys: 18, girls: 11 },
    { condition: "Tuberculosis", boys: 8, girls: 3 },
    { condition: "Pneumonia", boys: 20, girls: 15 },
    { condition: "Other", boys: 4, girls: 3 },
  ]

  // Calculate today's appointments
  const todayAppointments = useMemo(() => {
    const todayData = appointmentData.find((item) => Number.parseInt(item.day) === selectedDay)
    return todayData ? todayData.scheduled + todayData.canceled : 15
  }, [appointmentData, selectedDay])

  const handlePrevDay = () => {
    setSelectedDay((prev) => Math.max(1, prev - 1))
  }

  const handleNextDay = () => {
    setSelectedDay((prev) => Math.min(daysInMonth, prev + 1))
  }

  const handleDownload = () => {
    // Simulate download functionality
    const data = {
      appointments: appointmentData,
      patientTypes: patientTypeData,
      patientStats: patientStatsData,
      date: `${selectedMonth}/${selectedYear}`,
      day: selectedDay,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `patient-statistics-${selectedMonth}-${selectedYear}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

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
                        {month.value}
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
                    disabled={selectedDay >= daysInMonth}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
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
                    <div className="text-lg font-semibold text-gray-700">Total patients :</div>
                    <div className="text-2xl font-bold text-gray-900">{(totalPatients / 1000).toFixed(1)} k</div>
                  </div>
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={patientTypeData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value">
                          {patientTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2">
                  {patientTypeData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{(item.value / 1000).toFixed(1)} k</span>
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
              <h3 className="text-lg font-semibold text-gray-700">Number of patients</h3>
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patientStatsData} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="condition" />
                  <YAxis />
                  <Bar dataKey="boys" fill="#60a5fa" name="Boys" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="girls" fill="#c084fc" name="Girls" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Boys</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Girls</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
