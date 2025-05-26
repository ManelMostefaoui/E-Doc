import { ArrowLeft } from "lucide-react"
import React, { useState, useEffect } from "react"
import axios from 'axios'

export default function PNotification() {
  const [notifications, setNotifications] = useState([]); // State for fetched notifications
  const [loading, setLoading] = useState(true); // Loading state
  const [apiError, setApiError] = useState(null); // API error state

  const API_BASE_URL = 'http://127.0.0.1:8000/api'

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

        console.log('Fetched patient notifications:', response.data)

        // Transform API data to match component structure
        const transformedNotifications = response.data.notifications.map(apiNotification => {
          const { id, type, data, created_at } = apiNotification
          const notificationData = data

          let doctorName = 'Unknown Doctor' // Placeholder, as doctor name is not in the provided API data structure example
          let date = ''
          let time = ''
          let needsAction = false // Determine if action buttons are needed based on notification type/status

          // Example transformation based on the Doctor's notification type provided earlier
          // This might need adjustment based on the actual notification types for patients
          if (type === 'App\\Notifications\\PatientCancelledAppointmentNotification') {
            // If a patient receives this, it might mean their cancellation was confirmed, or related to another patient's cancellation?
            // The logic here needs clarification based on actual patient notification types.
            // Assuming for now, patient notifications are primarily about appointments scheduled by the doctor.

            if (notificationData.data && notificationData.data.scheduled_at) {
              try {
                const scheduledAt = new Date(notificationData.data.scheduled_at)
                date = scheduledAt.toLocaleDateString() // Format date as needed
                time = scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format time as needed
              } catch (e) {
                console.error('Error parsing date/time:', e)
              }
            }
            // needsAction might be true for new appointment proposals needing approval
            // This logic will depend heavily on the actual patient notification types and data structure.

          } // Add conditions for other patient-specific notification types
          // else if (type === 'App\\\\Notifications\\\\PatientAppointmentScheduledNotification') { ... needsAction = true; ... }

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
            doctor: doctorName, // Use fetched doctor name if available in API data
            date: date,
            time: time,
            timeAgo: timeAgo,
            needsAction: needsAction,
          }
        })

        setNotifications(transformedNotifications)
      } catch (err) {
        console.error('Error fetching patient notifications:', err)
        setApiError(err.response?.data?.message || 'Failed to fetch patient notifications')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, []); // Empty dependency array means this effect runs once on mount

  const handleClose = () => {
    console.log('Attempting to close PNotification');
    document.dispatchEvent(new CustomEvent('closeNotifications'))
  }

  // Display loading or error state
  if (loading) {
    return (
      <div className="fixed top-0 right-0 w-80 h-screen bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] font-nunito transform transition-transform duration-300 ease-in-out z-50 flex items-center justify-center rounded-xl border border-gray-200">
        <div className="text-[#008080]">Loading notifications...</div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="fixed top-0 right-0 w-80 h-screen bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] font-nunito transform transition-transform duration-300 ease-in-out z-50 flex items-center justify-center rounded-xl border border-gray-200">
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
        <ArrowLeft
          className="absolute top-1/2 transform -translate-y-1/2 text-[#008080] cursor-pointer"
          onClick={handleClose}
        />
        <h1 className="text-[#008080] ml-8 text-xl font-bold">Notifications</h1>
      </div>

      <div className="divide-y divide-gray-200 overflow-y-auto h-[calc(100vh-60px)] scrollbar-thin">
        {notifications.length === 0 ? (
          <div className="px-6 py-4 text-gray-500 text-center text-sm">No notifications found.</div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="px-6 py-4">
              <div className="flex items-start">
                <div className="mr-3">
                  <img
                    src="/placeholder.svg?height=60&width=60"
                    alt="Doctor profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#008080]"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1a1a1a] text-sm leading-tight">
                    <span className="font-medium">{notification.doctor || 'Unknown Doctor'}</span>
                    {notification.date && notification.time ? (
                      <> has scheduled an appointment for you on{" "}
                        <span className="font-bold">{notification.date}</span> at{" "}
                        <span className="font-bold">{notification.time}</span></>
                    ) : ' '}
                  </p>
                  <p className="text-[#495057] text-xs mt-1">{notification.timeAgo}</p>

                  {notification.needsAction && (
                    <div className="flex mt-3 space-x-3">
                      <button className="bg-[#008080] text-white px-4 py-1 rounded-md font-medium hover:bg-[#006666] transition duration-150 text-sm">
                        Approve
                      </button>
                      <button className="text-[#C5283D] bg-[#F7F9F9] border-2 font-semibold flex items-center gap-4 border-[#C5283D] rounded-lg px-4 py-1 hover:text-[#F7F9F9] hover:bg-[#C5283D] transition duration-150 text-sm">
                        Deny
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
