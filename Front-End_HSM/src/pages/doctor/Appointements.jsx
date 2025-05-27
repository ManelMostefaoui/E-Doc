import {
  Calendar,
  Clock,
  Search,
  Ban,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import AppointmentForm from "../../components/CDoctor/AppointmentForm"

export default function Appointments() {
  // Add this state near your other state declarations
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)

  // State for selected date and settings
  const [selectedDate, setSelectedDate] = useState("25")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [workingDays, setWorkingDays] = useState({
    from: "Sunday",
    to: "Thursday"
  })
  const [workingHours, setWorkingHours] = useState({
    from: "9 : 00",
    to: "16 : 00"
  })
  const [maxAppointments, setMaxAppointments] = useState(25)
  const [appointments, setAppointments] = useState([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [bookingStatus, setBookingStatus] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 10,
    current_page: 1,
    last_page: 1
  })
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch appointments for selected date
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoadingAppointments(true);
      try {
        const token = localStorage.getItem('token');
        const selectedDateFormatted = `${getYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/appointments/by-day?date=${selectedDateFormatted}&page=${pagination.current_page}&per_page=${pagination.per_page}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        console.log('Fetched appointments:', response.data);
        console.log('First appointment data:', response.data.appointments[0]);
        const transformedAppointments = response.data.appointments.map((appointment) => {
          const scheduledTime = new Date(appointment.scheduled_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          console.log('Appointment consultation request:', appointment.consultation_request);
          console.log('Appointment patient:', appointment.consultation_request?.patient);
          console.log('Appointment user:', appointment.consultation_request?.patient?.user);
          const user = appointment.consultation_request?.patient?.user;
          return {
            id: appointment.id,
            time: scheduledTime,
            duration: `${appointment.duration} min`,
            name: user?.name || 'Unknown',
            gender: user?.gender || 'Unknown',
            status: appointment.status
          };
        });

        setAppointments(transformedAppointments);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
        }
        setAppointments([]);
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [selectedDate, currentDate, pagination.current_page]);

  // Fetch booking status for the month
  useEffect(() => {
    const fetchBookingStatus = async () => {
      setLoadingStatus(true);
      try {
        const token = localStorage.getItem('token');
        const year = getYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const response = await axios.get(
          `http://127.0.0.1:8000/api/consultations/monthly-booking-status?year=${year}&month=${month}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.data && response.data.data) {
          console.log('Booking status data:', response.data.data);
          setBookingStatus(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching booking status:', error);
      } finally {
        setLoadingStatus(false);
      }
    };

    fetchBookingStatus();
  }, [currentDate]);

  // Set body background color
  useEffect(() => {
    document.body.style.background = '#f7f9f9';
    return () => { document.body.style.background = ''; };
  }, []);

  // Options for dropdowns
  const dayOptions = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const hourOptions = ["8 : 00", "9 : 00", "10 : 00", "11 : 00", "12 : 00", "13 : 00", "14 : 00", "15 : 00", "16 : 00", "17 : 00", "18 : 00"]
  const maxOptions = [10, 15, 20, 25, 30, 35, 40]

  // Handle date selection
  const handleDateSelect = (day) => {
    setSelectedDate(day)
  }

  // Handle month navigation
  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Handle year navigation
  const handleYearChange = (direction) => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1)
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1)
    }
    setCurrentDate(newDate)
  }

  // Get month name
  const getMonthName = () => {
    return currentDate.toLocaleString('default', { month: 'long' })
  }

  // Get year
  const getYear = () => {
    return currentDate.getFullYear()
  }

  // Get days in month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  // Get first day of month
  const getFirstDayOfMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return new Date(year, month, 1).getDay()
  }

  // Handle working days change
  const handleWorkingDayChange = (type, value) => {
    setWorkingDays(prev => ({
      ...prev,
      [type]: value
    }))
  }

  // Handle working hours change
  const handleWorkingHourChange = (type, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [type]: value
    }))
  }

  // Handle max appointments change
  const handleMaxAppointmentsChange = (value) => {
    setMaxAppointments(value)
  }

  // Handle add appointment click
  const handleAddAppointment = () => {
    setShowAppointmentForm(true)
  }

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment)
  }

  // Handle delete appointment
  const handleDeleteAppointment = (id) => {
    setAppointments(appointments.filter(appointment => appointment.id !== id))
  }

  // Handle save edited appointment
  const handleSaveEdit = (editedAppointment) => {
    setAppointments(appointments.map(appointment =>
      appointment.id === editedAppointment.id ? editedAppointment : appointment
    ))
    setEditingAppointment(null)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      current_page: newPage
    }));
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments.filter(appointment =>
    appointment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.time.includes(searchTerm)
  );

  // Get status for a specific day
  const getDayStatus = (day) => {
    const date = `${getYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayStatus = bookingStatus.find(status => status.date === date);
    console.log('Checking status for date:', date, 'Found status:', dayStatus);

    if (!dayStatus) return 'few';

    switch (dayStatus.status) {
      case 'no_appointment':
        return 'few';
      case 'fully_booked':
        return 'fully-booked';
      case 'getting_filled':
        return 'getting-full';
      default:
        console.log('Unknown status:', dayStatus.status);
        return 'few';
    }
  }

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Content */}
        <main className="p-6">
          <h1 className="text-2xl font-medium text-[#008080] mb-6">Appointments :</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200 border border-gray-200"
                      onClick={() => handleYearChange('prev')}
                      title="Previous Year"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200 border border-gray-200"
                      onClick={() => handleMonthChange('prev')}
                      title="Previous Month"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="px-6 py-2 border rounded-lg text-center min-w-48 bg-white shadow-sm">
                    <span className="text-lg font-medium text-gray-900">{getMonthName()}</span>
                    <span className="text-lg font-medium text-gray-600 ml-2">{getYear()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200 border border-gray-200"
                      onClick={() => handleMonthChange('next')}
                      title="Next Month"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors duration-200 border border-gray-200"
                      onClick={() => handleYearChange('next')}
                      title="Next Year"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                  {/* Days of week */}
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div key={i} className="py-2 font-medium">
                      {day}
                    </div>
                  ))}

                  {/* Empty cells for days before first day of month */}
                  {Array.from({ length: getFirstDayOfMonth() }, (_, i) => (
                    <div key={`empty-${i}`} className="p-2"></div>
                  ))}

                  {/* Calendar days */}
                  {Array.from({ length: getDaysInMonth() }, (_, i) => i + 1).map((day) => (
                    <CalendarDay
                      key={day}
                      day={day}
                      status={getDayStatus(day)}
                      isSelected={selectedDate === day.toString()}
                      onClick={() => handleDateSelect(day.toString())}
                    />
                  ))}
                </div>

                <div className="flex justify-center mt-6 space-x-8">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#c5283d] mr-2"></div>
                    <span className="text-sm">Fully booked</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#ffd700] mr-2"></div>
                    <span className="text-sm">Getting full</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#008080] mr-2"></div>
                    <span className="text-sm">Few / no appointments</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                    placeholder="Search appointments..."
                  />
                </div>

                <div className="bg-white border border-[#008080] rounded-lg px-4 py-2.5 flex items-center text-[#008080]">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Selected Date:</span>
                  <span className="mx-2">{getMonthName()} {selectedDate}, {getYear()}</span>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="font-medium mb-4">Working days :</h2>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <span className="text-gray-500">From</span>
                      <select
                        value={workingDays.from}
                        onChange={(e) => handleWorkingDayChange('from', e.target.value)}
                        className="appearance-none bg-transparent pr-8"
                      >
                        {dayOptions.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 absolute right-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <span className="text-gray-500">To</span>
                      <select
                        value={workingDays.to}
                        onChange={(e) => handleWorkingDayChange('to', e.target.value)}
                        className="appearance-none bg-transparent pr-8"
                      >
                        {dayOptions.map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 absolute right-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="font-medium mb-4">Working hours :</h2>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <span className="text-gray-500">From</span>
                      <select
                        value={workingHours.from}
                        onChange={(e) => handleWorkingHourChange('from', e.target.value)}
                        className="appearance-none bg-transparent pr-8"
                      >
                        {hourOptions.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 absolute right-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between border rounded-lg p-3">
                      <span className="text-gray-500">To</span>
                      <select
                        value={workingHours.to}
                        onChange={(e) => handleWorkingHourChange('to', e.target.value)}
                        className="appearance-none bg-transparent pr-8"
                      >
                        {hourOptions.map(hour => (
                          <option key={hour} value={hour}>{hour}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 absolute right-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="font-medium mb-4">Max appointments :</h2>
                <div className="relative">
                  <div className="flex items-center justify-between border rounded-lg p-3">
                    <span className="text-gray-500">Max</span>
                    <select
                      value={maxAppointments}
                      onChange={(e) => handleMaxAppointmentsChange(parseInt(e.target.value))}
                      className="appearance-none bg-transparent pr-8"
                    >
                      {maxOptions.map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 absolute right-3" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-[#008080] text-white py-3 rounded-lg font-medium"
                onClick={handleAddAppointment}
              >
                Add appointment for {getMonthName()} {selectedDate}
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-white rounded-lg mt-6 overflow-hidden shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">
                Appointments List
                {loadingAppointments && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Time</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Duration</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Full name</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Gender</th>
                    <th className="px-6 py-4 text-left font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAppointments ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No appointments found for {getMonthName()} {selectedDate}, {getYear()}
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <AppointmentRow
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={() => handleEditAppointment(appointment)}
                        onDelete={() => handleDeleteAppointment(appointment.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loadingAppointments && pagination.total > 0 && (
              <div className="px-6 py-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {pagination.from} to {pagination.to} of {pagination.total} appointments
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Conditional rendering for AppointmentForm */}
      {showAppointmentForm && (
        <AppointmentForm onClose={() => setShowAppointmentForm(false)} />
      )}
    </div>
  )
}

function CalendarDay({ day, status, isSelected, onClick }) {
  const getStatusColor = () => {
    console.log('CalendarDay status:', status);
    switch (status) {
      case "fully-booked":
        return "bg-[#c5283d]"
      case "getting-full":
        return "bg-[#ffd700]"
      case "few":
        return "bg-[#008080]"
      default:
        console.log('Unknown status in CalendarDay:', status);
        return "bg-gray-200"
    }
  }

  return (
    <div
      className={`p-2 relative ${isSelected ? "border-2 border-[#008080] rounded-lg" : ""} cursor-pointer hover:bg-gray-100`}
      onClick={onClick}
    >
      <div className="text-center py-2">{day}</div>
      <div
        className={`w-3 h-3 rounded-full ${getStatusColor()} absolute bottom-1 left-1/2 transform -translate-x-1/2`}
      ></div>
    </div>
  )
}

function AppointmentRow({ appointment, onEdit, onDelete }) {
  return (
    <tr className="border-b">
      <td className="px-6 py-4">{appointment.time}</td>
      <td className="px-6 py-4">{appointment.duration}</td>
      <td className="px-6 py-4">{appointment.name}</td>
      <td className="px-6 py-4">{appointment.gender}</td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            className="text-gray-600 hover:text-blue-600"
            onClick={onEdit}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            className="text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <Ban className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}
