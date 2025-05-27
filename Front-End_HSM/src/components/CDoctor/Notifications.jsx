import { useState, useEffect } from "react"
import { Bell, Search, Filter, Settings2, ChevronDown, Calendar } from "lucide-react"
import AppointmentModal from "../AppointmentModal"
import axios from "axios"

const styles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;

function NotificationCard({ consultation, onSchedule }) {
  const { patient, message, status, created_at, appointment_date } = consultation
  const { user } = patient

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this consultation request?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://127.0.0.1:8000/api/consultation-request/${consultation.id}/canceldoc`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling consultation:', error);
      alert('Failed to cancel consultation. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending'
      case 'confirmed':
        return 'Approved'
      case 'declined':
        return 'Declined'
      case 'scheduled':
        return 'Scheduled'
      default:
        return status
    }
  }

  const currentStatus = getStatus(status)

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#008080] bg-white">
            {user.profile_photo ? (
              <img src={user.profile_photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl text-gray-400">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[#008080] text-lg">{user.name}</h3>
            <p className="text-sm text-gray-600">Student</p>
          </div>
        </div>
        {currentStatus === "Pending" && (
          <div className="flex gap-2">
            <button
              className="w-32 h-12 flex items-center justify-center px-6 py-2 bg-red-500 text-white rounded-xl font-semibold text-md shadow-sm hover:bg-red-600 transition-colors whitespace-nowrap"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="w-56 h-12 flex items-center justify-center px-6 py-2 bg-[#008080] text-white rounded-xl font-semibold text-md shadow-sm hover:bg-[#004d4d] transition-colors whitespace-nowrap"
              onClick={onSchedule}
            >
              Schedule an appointment
            </button>
          </div>
        )}
        {currentStatus === "Approved" && (
          <span className="w-56 px-6 py-2 border-2 border-[#008080] text-[#008080] rounded-xl font-semibold text-md shadow-sm bg-transparent flex items-center justify-center">
            {formatDate(appointment_date)}
          </span>
        )}
        {currentStatus === "Scheduled" && (
          <span className="w-56 flex items-center gap-2 px-6 py-2 border-2 border-black text-black rounded-xl font-semibold text-md shadow-sm bg-transparent mr-4 justify-center">
            <Calendar size={20} className="text-black" />
            {formatDate(appointment_date)}
          </span>
        )}
        {currentStatus === "Declined" && (
          <div className="flex gap-2 items-center">
            <button className="w-56 px-6 py-2 bg-[#008080] text-white rounded-xl font-semibold text-md shadow-sm hover:bg-[#004d4d] transition-colors" onClick={onSchedule}>
              Reschedule
            </button>
            <span className="w-56 px-6 py-2 border-2 border-[#D90429] text-[#D90429] rounded-xl font-semibold text-md shadow-sm bg-transparent flex items-center justify-center">
              {formatDate(appointment_date)}
            </span>
          </div>
        )}
      </div>
      {message && (
        <div className="border-t border-gray-100 p-6">
          <div className={`text-sm rounded-xl border border-gray-200 p-4 ${currentStatus === "Approved" ? "bg-transparent text-[#008080] border-[#008080]" : "bg-[#f7f9f9] text-gray-700"}`}>
            {currentStatus === "Pending" && <p className="mb-2">{formatDate(created_at)}</p>}
            <div className="whitespace-pre-line">{message}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Notifications() {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('pending')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [cancellingId, setCancellingId] = useState(null)

  const filterOptions = ['pending', 'scheduled', 'confirmed', 'cancelled']

  // Function to fetch consultations
  const fetchConsultations = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.get(`http://127.0.0.1:8000/api/consultations?status=${selectedFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (response.data && response.data.data) {
        setConsultations(response.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch consultations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Fetch consultations when the component mounts or selectedFilter changes
    fetchConsultations()
  }, [selectedFilter]) // Dependency array includes selectedFilter

  // Handler to open modal
  const handleOpenModal = (consultation) => {
    setSelectedConsultation(consultation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedConsultation(null)
    setIsModalOpen(false)
    // Refresh consultations after closing the modal
    fetchConsultations()
  }

  return (
    <div className="flex h-screen bg-[#f7f9f9]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#eef5f5] scrollbar-hide">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-semibold text-[#008080] mb-6">Notifications :</h1>

            {/* Search and Filter */}
            <div className="flex justify-between mb-6">
              <div className="relative w-80">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#008080]"
                />
              </div>
              <div className="relative">
                <button
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white border border-gray-200"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <span className="capitalize">{selectedFilter}</span>
                  <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      {filterOptions.map((status) => (
                        <button
                          key={status}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#eef5f5] capitalize"
                          onClick={() => {
                            setSelectedFilter(status)
                            setIsFilterOpen(false)
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#008080]"></div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}

            {/* Notifications */}
            {!loading && !error && (
              <div className="space-y-6">
                {consultations.map((consultation) => (
                  <NotificationCard
                    key={consultation.id}
                    consultation={consultation}
                    onSchedule={() => handleOpenModal(consultation)}
                  />
                ))}
                {consultations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No consultations found
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        consultationId={selectedConsultation?.id}
        onSuccess={fetchConsultations}
      />
    </div>
  )
} 