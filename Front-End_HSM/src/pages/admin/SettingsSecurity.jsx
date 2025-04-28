import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function SettingsPage() {
  const navigate = useNavigate()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const token = localStorage.getItem('token')
    
    // Redirect to login if no token exists
    if (!token) {
      navigate('/login')
      return
    }
  }, [navigate])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    // Validate passwords
    if (!currentPassword) {
      setError("Current password is required")
      return
    }
    
    if (!newPassword) {
      setError("New password is required")
      return
    }
    
    if (newPassword !== newPasswordConfirmation) {
      setError("New passwords do not match")
      return
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await axios.post('http://127.0.0.1:8000/api/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Password updated successfully:', response.data)
      
      // Update the admin data in sessionStorage to reflect the password change
      try {
        const adminKey = 'admin_user_data'
        const storedData = sessionStorage.getItem(adminKey)
        
        if (storedData) {
          const adminData = JSON.parse(storedData)
          
          // Note that we don't store the actual password in sessionStorage for security
          // but we can update a timestamp to indicate the password was changed
          const updatedData = {
            ...adminData,
            passwordLastUpdated: new Date().toISOString()
          }
          
          sessionStorage.setItem(adminKey, JSON.stringify(updatedData))
          console.log('Updated admin sessionStorage with password change timestamp')
        }
      } catch (err) {
        console.error('Error updating session storage after password change:', err)
        // Continue anyway as this is not critical
      }
      
      // Check if the API returned a new token and update it
      let tokenUpdated = false
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token)
        console.log('Updated authentication token after password change')
        tokenUpdated = true
      }
      
      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setNewPasswordConfirmation("")
      
      // Show success message with appropriate follow-up
      if (tokenUpdated) {
        setSuccess("Password updated successfully! Your session has been updated with a new token. You'll be redirected to ensure security.")
        
        // Set a timer to redirect the user after they've seen the success message
        setTimeout(() => {
          // Redirect to homepage or login page to refresh the session
          navigate('/')
        }, 5000) // 5-second delay to let the user read the message
      } else {
        setSuccess("Password updated successfully! Your new password is now active.")
      }
    } catch (error) {
      console.error('Error updating password:', error)
      
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.response?.data?.errors?.current_password) {
        setError(error.response.data.errors.current_password[0])
      } else if (error.response?.data?.errors?.password) {
        setError(error.response.data.errors.password[0]) 
      } else if (error.response?.status === 401) {
        setError("Current password is incorrect")
      } else if (error.response?.status === 422) {
        setError("Validation failed. Please check your input.")
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.")
      } else {
        setError("Failed to update password. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="ml-3 p-0.5" >
        <h1 className="text-[30px] font-montserat font-bold text-[#008080] mb-3">Settings :</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="mb-8">
          <h2 className="font-bold mb-3 font-montserat text-[24px] text-[#004d4d] ">Change password :</h2>
          <p className="text-[#1A1A1A] font-nunito font-normal mb-5 ">
            For security reasons, please update your password. Enter your current password, then choose a new one. Make sure your new password is strong and unique.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="max-w-[600px] ">
              <label className="block mb-3 font-nunito text-[16px] font-norma text-[#1A1A1A] font-semibold">Current password :</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full p-4  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] "
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-4.5 top-1/2 transform -translate-y-1/2 text-[#008080]"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={loading}
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="max-w-[600px]">
              <label className="block mb-3 font-nunito text-[16px] font-norma text-[#1A1A1A] font-semibold">New password :</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-4.5 top-1/2 transform -translate-y-1/2 text-[#008080]"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Password must be at least 8 characters long and should include a mix of letters, numbers, and special characters.
              </p>
            </div>

            <div className="max-w-[600px]">
              <label className="block mb-3 font-nunito text-[16px] font-norma text-[#1A1A1A] font-semibold">Confirm new password :</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10"
                  placeholder="Confirm new password"
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-4.5 top-1/2 transform -translate-y-1/2 text-[#008080]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#008080] text-white px-6 py-3 rounded-md hover:bg-[#006666] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : "Update Password"}
            </button>
          </form>
        </div>
      </div>
  )
}