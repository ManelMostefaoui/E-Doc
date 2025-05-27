import { ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function DNotification() {
  const [activeTab, setActiveTab] = useState("appointments")
  const [notifications, setNotifications] = useState([]); // State for fetched notifications
  const [loading, setLoading] = useState(true); // Loading state
  const [apiError, setApiError] = useState(null); // API error state

  const API_BASE_URL = 'http://127.0.0.1:8000/api'
  const navigate = useNavigate(); // Initialize navigate hook

  const handleClose = () => {
    console.log('Attempting to close DNotification');
    // Dispatch a custom event that the parent component can listen to
    document.dispatchEvent(new CustomEvent('closeNotifications'))
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setApiError(null)
        const token = localStorage.getItem('token')
        if (!token) {
          // Handle missing token - maybe redirect to login or show an error
          console.error('Authentication token not found.')
          setApiError('Authentication required.')
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_BASE_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        console.log('Fetched notifications:', response.data)

        // Transform API data to match component structure
        const transformedNotifications = response.data.notifications.map(apiNotification => {
          const { id, type, data, created_at } = apiNotification
          const notificationData = data

          let person = 'Unknown'
          let action = ''
          let description = ''
          let date = ''
          let time = ''
          let hasButton = false
          let buttonText = ''

          // Derive information based on notification type
          if (type === 'App\\Notifications\\NewConsultationRequestNotification') {
            person = notificationData.patient_name || 'A patient'
            action = 'has requested'
            description = 'a consultation'
            hasButton = true
            buttonText = 'View Request'
            if (notificationData.requested_at) {
              try {
                const requestedAt = new Date(notificationData.requested_at)
                date = requestedAt.toLocaleDateString()
                time = requestedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              } catch (e) {
                console.error('Error parsing date/time:', e)
              }
            }
          } else if (type === 'App\\Notifications\\PatientCancelledAppointmentNotification') {
            person = notificationData.patient_name || 'A patient'
            action = 'has cancelled'
            description = 'their appointment'
            hasButton = true
            buttonText = 'Reschedule'
            if (notificationData.scheduled_at) {
              try {
                const scheduledAt = new Date(notificationData.scheduled_at)
                date = scheduledAt.toLocaleDateString()
                time = scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              } catch (e) {
                console.error('Error parsing date/time:', e)
              }
            }
          } else if (type === 'App\\Notifications\\AppointmentConfirmedNotification') {
            person = notificationData.patient_name || 'A patient'
            action = 'has confirmed'
            description = 'their appointment'
            if (notificationData.scheduled_at) {
              try {
                const scheduledAt = new Date(notificationData.scheduled_at)
                date = scheduledAt.toLocaleDateString()
                time = scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              } catch (e) {
                console.error('Error parsing date/time:', e)
              }
            }
          } else if (type === 'App\\Notifications\\DoctorCancelledAppointmentNotification') {
            person = notificationData.patient_name || 'A patient'
            action = 'appointment has been cancelled'
            description = 'by the doctor'
            if (notificationData.scheduled_at) {
              try {
                const scheduledAt = new Date(notificationData.scheduled_at)
                date = scheduledAt.toLocaleDateString()
                time = scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              } catch (e) {
                console.error('Error parsing date/time:', e)
              }
            }
          }
          // Add conditions for other notification types (e.g., accepted, new request)
          // else if (type === 'App\\\\Notifications\\\\...\') { ... }

          // Calculate time ago (basic implementation)
          const notificationDate = new Date(created_at)
          const now = new Date()
          const secondsAgo = Math.round((now - notificationDate) / 1000)

          let timeAgo = ''
          if (secondsAgo < 60) {
            timeAgo = `${secondsAgo} seconds ago`
          } else if (secondsAgo < 3600) {
            timeAgo = `${Math.round(secondsAgo / 60)} minutes ago`
          } else if (secondsAgo < 86400) {
            timeAgo = `${Math.round(secondsAgo / 3600)} hours ago`
          } else {
            timeAgo = `${Math.round(secondsAgo / 86400)} days ago`
          }

          return {
            id: id,
            type: notificationData.type || 'unknown', // Use data.type if available
            person: person,
            action: action,
            description: description,
            date: date,
            time: time,
            timeAgo: timeAgo,
            hasButton: hasButton,
            buttonText: buttonText,
          }
        })

        setNotifications(transformedNotifications)
      } catch (err) {
        console.error('Error fetching notifications:', err)
        setApiError(err.response?.data?.message || 'Failed to fetch notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, []); // Empty dependency array means this effect runs once on mount

  // Display loading or error state
  if (loading) {
    return (
      <div className="fixed top-0 right-0 w-96 h-screen bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] font-nunito transform transition-transform duration-300 ease-in-out z-50 flex items-center justify-center rounded-xl border border-gray-200">
        <div className="text-[#008080]">Loading notifications...</div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="fixed top-0 right-0 w-96 h-screen bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] font-nunito transform transition-transform duration-300 ease-in-out z-50 flex items-center justify-center rounded-xl border border-gray-200">
        <div className="text-red-500 text-center px-4">Error loading notifications: {apiError}</div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 right-0 w-80 h-screen bg-white shadow-[2px_2px_12px_rgba(0,0,0,0.25)] font-nunito transform transition-transform duration-300 ease-in-out z-50 rounded-xl border border-gray-200">
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #D1D5DB;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
        }
      `}</style>
      <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex items-center rounded-t-xl">
        <button
          onClick={handleClose}
          className="absolute top-1/2 transform -translate-y-1/2 text-[#008080] cursor-pointer hover:text-[#006666] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[#008080] ml-8 text-xl font-bold">Notifications</h1>
      </div>

      <div className="divide-y divide-gray-200 overflow-y-auto h-[calc(100vh-60px)] scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-center text-sm">No notifications found.</div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="px-6 py-4 cursor-pointer hover:bg-gray-50" onClick={() => {
              navigate(`/settings/notifications`, { state: { notificationId: notification.id } });
              handleClose(); // Dispatch close event after navigation
            }}>
              <div className="flex items-start">
                <div className="mr-3">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
                  />
                </div>

                <div className="flex-1 text-left items-start">
                  <p className="text-[#1a1a1a] text-sm leading-tight">
                    <span className={`font-medium ${notification.type === 'declined' ? 'text-[#c5283d]' : 'text-[#008080]'}`}>
                      {notification.person}
                    </span>{' '}
                    {notification.action}{' '}
                    {notification.description}{' '}
                    {notification.date && notification.time ? (
                      <>on <span className="font-bold">{notification.date}</span> at <span className="font-bold">{notification.time}</span></>
                    ) : null}
                  </p>
                  <p className="text-[#495057] text-xs mt-1">{notification.timeAgo}</p>

                  {notification.hasButton && (notification.buttonText === 'Reschedule') && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <button className="bg-[#008080] text-white px-4 py-1 rounded-md font-medium hover:bg-[#006666} transition duration-150 text-sm">
                        {notification.buttonText}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
