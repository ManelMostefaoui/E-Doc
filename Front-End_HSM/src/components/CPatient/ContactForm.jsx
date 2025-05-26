import { ChevronDown, Pencil } from "lucide-react"
import { useState } from "react"
import axios from "axios"

function ContactForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    details: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess(false)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("You must be logged in to send a consultation request")
      }

      const response = await axios.post('http://127.0.0.1:8000/api/consultation-request', {
        message: formData.details
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })

      if (response.data) {
        setSuccess(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err) {
      console.error("Failed to send consultation request:", err)
      setError(err.response?.data?.message || err.message || "Failed to send consultation request")
    } finally {
      setLoading(false)
    }
  }

  const renderTextArea = (label, field) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <label className="mb-2 sm:mb-0 text-[#1A1A1A]">{label}</label>
        <div className="relative w-full sm:w-95">
          <textarea
            rows="1"
            className="w-full py-3 px-6 border border-[#008080]/40 rounded-lg pr-10 resize-none overflow-hidden focus:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:outline-none"
            value={formData[field]}
            onChange={(e) => {
              handleChange(field, e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = e.target.scrollHeight + "px"
            }}
            placeholder={label}
            disabled={loading}
          />
          <Pencil className="absolute right-6 top-1/2 h-3 transform -translate-y-1/2 pointer-events-none text-[#495057]" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[#f7f9f9] rounded-xl shadow-[2px_2px_12px_rgba(0,0,0,0.25)] w-full max-w-2xl max-h-[90vh] p-3 border border-gray-100 overflow-hidden flex flex-col">
        {/* Header with close button */}
        <div className="flex justify-between items-center py-3 px-7 mt-4">
          <h2 className="font-nunito text-[30px] text-[#008080] font-bold text-center flex-grow">Contact the doctor :</h2>
          <button onClick={onClose} className="text-teal-600 text-4xl font-semibold hover:text-teal-800">×</button>
        </div>

        <div className="px-12 text-center text-[#1A1A1A] font-nunito text-[16px] mb-5">
          <p>
            Complete the required information below. Once your request is sent, the doctor will review it and schedule an appointment time for you.
            You will be notified once it's confirmed.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mx-12 mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            Consultation request sent successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-12 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Form content with scrollable area */}
        <div className="flex-1 scrollable-container overflow-y-auto mr-6 px-12 py-2 font-nunito text-[16px] mb-2 mt-2">
          <div className="space-y-4">
            {renderTextArea("Title :", "title")}
            {renderTextArea("Details :", "details")}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-11 p-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`text-[#f7f9f9] ${loading ? 'bg-gray-400' : 'bg-[#008080] hover:bg-[#006666]'} font-semibold flex items-center gap-4 border-2 ${loading ? 'border-gray-400' : 'border-[#008080]'} rounded-lg px-13 py-2 transition duration-150`}
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#C5283D] bg-[#F7F9F9] border-2 font-semibold flex items-center gap-4 border-[#C5283D] rounded-lg px-13 py-2 hover:text-[#F7F9F9] hover:bg-[#C5283D] transition duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactForm