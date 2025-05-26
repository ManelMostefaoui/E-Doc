import { useState } from "react"
import { Bell, Search, Filter, Settings2, ChevronDown, Calendar } from "lucide-react"
import AppointmentModal from "../AppointmentModal"

function NotificationCard({ name, role, date, title, message, avatarUrl, status, onSchedule }) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#008080] bg-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[#008080] text-lg">{name}</h3>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>
        {status === "Pending" && (
          <button className="w-56 h-12 flex items-center justify-center px-6 py-2 bg-[#008080] text-white rounded-xl font-semibold text-md shadow-sm hover:bg-[#004d4d] transition-colors whitespace-nowrap" onClick={onSchedule}>
            Schedule an appointment
          </button>
        )}
        {status === "Approved" && (
          <span className="w-56 px-6 py-2 border-2 border-[#008080] text-[#008080] rounded-xl font-semibold text-md shadow-sm bg-transparent flex items-center justify-center">
            {date}
          </span>
        )}
        {status === "Scheduled" && (
          <span className="w-56 flex items-center gap-2 px-6 py-2 border-2 border-black text-black rounded-xl font-semibold text-md shadow-sm bg-transparent mr-4 justify-center">
            <Calendar size={20} className="text-black" />
            {date}
          </span>
        )}
        {status === "Declined" && (
          <div className="flex gap-2 items-center">
            <button className="w-56 px-6 py-2 bg-[#008080] text-white rounded-xl font-semibold text-md shadow-sm hover:bg-[#004d4d] transition-colors" onClick={onSchedule}>
              Reschedule
            </button>
            <span className="w-56 px-6 py-2 border-2 border-[#D90429] text-[#D90429] rounded-xl font-semibold text-md shadow-sm bg-transparent flex items-center justify-center">
              {date}
            </span>
          </div>
        )}
      </div>
      {(message || title) && (
        <div className="border-t border-gray-100 p-6">
          <div className={`text-sm rounded-xl border border-gray-200 p-4 ${status === "Approved" ? "bg-transparent text-[#008080] border-[#008080]" : "bg-[#f7f9f9] text-gray-700"}`}>
            {status === "Pending" && <p className="mb-2">{date}</p>}
            {title && <p className="mb-2 font-semibold">Title : <span className="font-normal">{title}</span></p>}
            {message && <div className="whitespace-pre-line">{message}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Notifications() {
  const [notifications] = useState([
    {
      id: 1,
      name: "Benebbi Ahlem",
      role: "Student",
      date: "Sun, 25 avril 10 : 45",
      title: "Schedule an appointment",
      message: `Hello Doctor,\nI would like to schedule an appointment with you at your earliest convenience. I've also attached my recent test results for your review before the consultation.\nPlease let me know your available times.\nThank you!`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Pending"
    },
    {
      id: 2,
      name: "Belkara asmaa",
      role: "Student",
      date: "Mon, 20 avril 10 : 00",
      title: "Consultation Request",
      message: `Hello,\nI would like to request a consultation regarding my recent health issues. Please let me know your available slots.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Approved"
    },
    {
      id: 3,
      name: "Yasmine Bouchareb",
      role: "Student",
      date: "Tue, 21 avril 09 : 30",
      title: "Medical Advice",
      message: `Dear Doctor,\nI need your advice on my ongoing treatment. Can we schedule a meeting this week?`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Declined"
    },
    {
      id: 4,
      name: "Omar Boudelia",
      role: "Student",
      date: "Wed, 22 avril 14 : 15",
      title: "Follow-up Appointment",
      message: `Hi,\nI would like to book a follow-up appointment for my last visit. Please confirm your availability.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Scheduled"
    },
    {
      id: 5,
      name: "Sara Amrani",
      role: "Student",
      date: "Thu, 23 avril 11 : 00",
      title: "Routine Checkup",
      message: `Hello Doctor,\nI am due for my routine checkup. Kindly let me know when I can come in.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Declined"
    },
    {
      id: 6,
      name: "Nabil Kacem",
      role: "Student",
      date: "Sat, 24 avril 11 : 45",
      title: "Scheduled Consultation",
      message: `Doctor,\nMy consultation has been scheduled. Please confirm the time.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Scheduled"
    },
    {
      id: 7,
      name: "Lina Merabet",
      role: "Student",
      date: "Fri, 23 avril 15 : 00",
      title: "Approved Appointment",
      message: `Thank you for approving my appointment. Looking forward to our meeting.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Approved"
    },
    {
      id: 8,
      name: "Walid Benali",
      role: "Student",
      date: "Fri, 30 avril 13 : 00",
      title: "Declined Request",
      message: `Unfortunately, your appointment request was declined. Please reschedule if needed.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Declined"
    },
    {
      id: 9,
      name: "Samiha Touati",
      role: "Student",
      date: "Thu, 29 avril 09 : 30",
      title: "Declined Appointment",
      message: `Your appointment could not be confirmed. Please try rescheduling for another date.`,
      avatarUrl: "/placeholder.svg?height=80&width=80",
      status: "Declined"
    }
  ])

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("Pending")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter notifications by status
  const filteredNotifications = notifications.filter(
    n => n.status === selectedFilter
  )

  // Handler to open modal
  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)

  return (
    <div className="flex h-screen bg-[#f7f9f9]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-[#eef5f5]">
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
                  <span>{selectedFilter}</span>
                  <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#eef5f5]"
                        onClick={() => {
                          setSelectedFilter("Pending")
                          setIsFilterOpen(false)
                        }}
                      >
                        Pending
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#eef5f5]"
                        onClick={() => {
                          setSelectedFilter("Approved")
                          setIsFilterOpen(false)
                        }}
                      >
                        Approved
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#eef5f5]"
                        onClick={() => {
                          setSelectedFilter("Declined")
                          setIsFilterOpen(false)
                        }}
                      >
                        Declined
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#eef5f5]"
                        onClick={() => {
                          setSelectedFilter("Scheduled")
                          setIsFilterOpen(false)
                        }}
                      >
                        Scheduled
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-6 w-full">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  name={notification.name}
                  role={notification.role}
                  date={notification.date}
                  title={notification.title}
                  message={notification.message}
                  avatarUrl={notification.avatarUrl}
                  status={notification.status}
                  onSchedule={handleOpenModal}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
      <AppointmentModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
} 