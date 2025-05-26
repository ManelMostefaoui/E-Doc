import { Bell } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import DefaultUserPhoto from '../assets/DefaultUserPhoto.jpg'
import DNotification from './CDoctor/DNotification'
import PNotification from './CPatient/PNotification'

export default function Navbar() {
  const [user, setUser] = useState({
    // Default admin values from AdminSeeder
    name: 'Admin',
    email: 'admin@esi-sba.dz',
    role: { name: 'admin' }
  })
  const [profileImage, setProfileImage] = useState(DefaultUserPhoto)
  const [loading, setLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = JSON.parse(localStorage.getItem('user'))

    if (userData && userData.role) {
      setUser(userData)
      setUserRole(typeof userData.role === 'string' ? userData.role : userData.role?.name)
    } else if (token) {
      const fetchUserProfile = async () => {
        try {
          setLoading(true)

          // First, check if we have admin data in sessionStorage
          const adminKey = 'admin_user_data'
          const storedAdminData = sessionStorage.getItem(adminKey)

          if (storedAdminData) {
            try {
              console.log('Found admin data in sessionStorage for navbar')
              const adminData = JSON.parse(storedAdminData)

              // If we have valid admin data, use it
              if (adminData && adminData.email) {
                console.log('Using admin data from sessionStorage for navbar')

                // Extract first and last name if not explicitly provided but name is available
                if (adminData.name && (!adminData.firstName || !adminData.lastName)) {
                  const nameParts = adminData.name.split(' ');
                  if (nameParts.length >= 2) {
                    adminData.firstName = adminData.firstName || nameParts[0];
                    adminData.lastName = adminData.lastName || nameParts.slice(1).join(' ');
                    console.log('Extracted first and last name from sessionStorage name for navbar:', adminData.firstName, adminData.lastName);
                  } else if (nameParts.length === 1) {
                    adminData.firstName = adminData.firstName || nameParts[0];
                    adminData.lastName = adminData.lastName || '';
                  }
                }

                setUser(adminData)
                setUserRole(typeof adminData.role === 'string' ? adminData.role : adminData.role?.name)

                // If the admin has a profile picture stored in sessionStorage, use it
                if (adminData.picture) {
                  if (typeof adminData.picture === 'string' && adminData.picture.startsWith('data:image')) {
                    console.log('Using admin profile image from sessionStorage (base64) for navbar')
                    setProfileImage(adminData.picture)
                  } else if (typeof adminData.picture === 'string' &&
                    (adminData.picture.startsWith('http') || adminData.picture.includes('//'))) {
                    console.log('Using admin profile image from sessionStorage (URL) for navbar')
                    setProfileImage(adminData.picture)
                  } else {
                    console.log('Using admin profile image from storage path for navbar')
                    setProfileImage(`http://127.0.0.1:8000/storage/${adminData.picture}`)
                  }
                } else if (adminData.picture_base64) {
                  // Use backup base64 image if available
                  console.log('Using admin backup base64 image for navbar')
                  setProfileImage(adminData.picture_base64)
                }
              }
            } catch (err) {
              console.error('Error parsing admin data from sessionStorage for navbar:', err)
              // Continue to API fetch if there's an error with sessionStorage data
            }
          }

          // Get current user data from the API
          const response = await axios.get('http://127.0.0.1:8000/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })

          // Only update if we have actual data
          if (response.data && response.data.email) {
            const userData = response.data;
            setUser(userData)
            setUserRole(typeof userData.role === 'string' ? userData.role : userData.role?.name)

            // Extract first and last name if not explicitly provided but name is available
            if (userData.name && (!userData.firstName || !userData.lastName)) {
              const nameParts = userData.name.split(' ');
              if (nameParts.length >= 2) {
                userData.firstName = userData.firstName || nameParts[0];
                userData.lastName = userData.lastName || nameParts.slice(1).join(' ');
                console.log('Extracted first and last name from full name for navbar:', userData.firstName, userData.lastName);
              } else if (nameParts.length === 1) {
                userData.firstName = userData.firstName || nameParts[0];
                userData.lastName = userData.lastName || '';
              }
            }

            // Check if the response includes a picture
            if (response.data.picture) {
              if (typeof response.data.picture === 'string' && response.data.picture.startsWith('data:image')) {
                setProfileImage(response.data.picture)
              } else if (typeof response.data.picture === 'string' &&
                (response.data.picture.startsWith('http') || response.data.picture.includes('//'))) {
                setProfileImage(response.data.picture)
              } else {
                setProfileImage(`http://127.0.0.1:8000/storage/${response.data.picture}`)
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch user data for navbar:", err)
        } finally {
          setLoading(false)
        }
      }

      fetchUserProfile()

      // Setup an event listener to update the profile image if it changes elsewhere
      const handleStorageChange = () => {
        try {
          const adminKey = 'admin_user_data'
          const storedAdminData = sessionStorage.getItem(adminKey)

          if (storedAdminData) {
            const adminData = JSON.parse(storedAdminData)

            // Extract user data if available, including first/last name
            if (adminData && adminData.email) {
              // Extract name information if present
              if (adminData.name && (!adminData.firstName || !adminData.lastName)) {
                const nameParts = adminData.name.split(' ');
                if (nameParts.length >= 2) {
                  adminData.firstName = adminData.firstName || nameParts[0];
                  adminData.lastName = adminData.lastName || nameParts.slice(1).join(' ');
                } else if (nameParts.length === 1) {
                  adminData.firstName = adminData.firstName || nameParts[0];
                  adminData.lastName = adminData.lastName || '';
                }
              }

              // Update the user state with the latest data
              setUser(adminData);
              setUserRole(typeof adminData.role === 'string' ? adminData.role : adminData.role?.name)
            }

            // Update the profile image if it exists
            if (adminData.picture) {
              if (typeof adminData.picture === 'string' && adminData.picture.startsWith('data:image')) {
                setProfileImage(adminData.picture)
              } else if (typeof adminData.picture === 'string' &&
                (adminData.picture.startsWith('http') || adminData.picture.includes('//'))) {
                setProfileImage(adminData.picture)
              } else {
                setProfileImage(`http://127.0.0.1:8000/storage/${adminData.picture}`)
              }
            } else if (adminData.picture_base64) {
              setProfileImage(adminData.picture_base64)
            }
          }
        } catch (err) {
          console.error('Error handling storage change for navbar:', err)
        }
      }

      // Listen for custom events from SettingsPersonalinformations
      window.addEventListener('adminProfileUpdated', handleStorageChange)

      // Check periodically for changes to the admin profile
      const checkInterval = setInterval(handleStorageChange, 5000)

      return () => {
        window.removeEventListener('adminProfileUpdated', handleStorageChange)
        clearInterval(checkInterval)
      }
    }

    const handleCloseNotifications = () => {
      setShowNotifications(false)
    }

    document.addEventListener('closeNotifications', handleCloseNotifications)
    return () => {
      document.removeEventListener('closeNotifications', handleCloseNotifications)
    }
  }, [])

  const shouldShowNotifications = ['doctor', 'student', 'teacher', 'employer'].includes(userRole)
  const isDoctor = userRole === 'doctor'

  return (
    <header className="bg-[#F7F9F9] h-18 border-b border-gray-200 py-3 px-12 flex justify-between z-40  items-center shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
      <div className="flex items-center">
        <img src="/LogoApp.svg" alt="logo" className="h-9 w-auto flex-shrink-0" />
      </div>

      <div className="flex items-center gap-4">
        {shouldShowNotifications && (
          <button
            className="p-2 rounded-full hover:bg-[#eef5f5] relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
          </button>
        )}

        <div className="flex items-center gap-4">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <img
              src={profileImage}
              alt="User Avatar"
              className="w-8 h-8 object-cover rounded-full"
              onError={(e) => {
                console.log('Navbar profile image failed to load, trying fallback')
                // Try to get user data from sessionStorage as fallback
                try {
                  const adminKey = 'admin_user_data'
                  const storedData = sessionStorage.getItem(adminKey)

                  if (storedData) {
                    const adminData = JSON.parse(storedData)

                    // Check if the adminData has a picture_base64 backup
                    if (adminData.picture_base64) {
                      console.log('Using base64 backup image for navbar')
                      e.target.src = adminData.picture_base64
                      return
                    }
                  }
                } catch (err) {
                  console.error('Error trying to find backup admin image for navbar:', err)
                }

                // If we got here, fall back to the default image
                e.target.src = DefaultUserPhoto
              }}
            />
          </div>

          <div className="hidden md:block">
            <div className="font-medium text-sm">
              {user.name || 'User'}
            </div>
            <div className="text-xs text-[#495057]">{user.role?.name || user.role || 'Admin'}</div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (isDoctor ? <DNotification /> : <PNotification />)}
    </header>
  )
}
