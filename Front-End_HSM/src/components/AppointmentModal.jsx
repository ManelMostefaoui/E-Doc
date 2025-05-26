import React, { useState } from "react"
import axios from "axios"

export default function AppointmentModal({ isOpen, onClose, consultationId }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    duration: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/api/appointments/create-with-consultation/${consultationId}`,
        {
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        onClose()
      }
    } catch (err) {
      console.error('Failed to create appointment:', err)
      setError(err.response?.data?.message || 'Failed to create appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-xl w-full relative border-2 border-[#e5e7eb]">
        <button
          className="absolute top-6 right-6 text-[#008080] text-3xl font-bold hover:text-[#004d4d]"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-[#008080] text-center mb-2">Add new appointement :</h2>
        <p className="text-center text-gray-700 mb-6">
          Fill in the details below to schedule a new appointment. Make sure all fields are accurate before saving, so your patient records stay up to date.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Date :</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="border border-[#008080] rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Time :</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="border border-[#008080] rounded-lg px-4 py-2 w-full"
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Duration :</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              className="border border-[#008080] rounded-lg px-4 py-2 w-full"
            >
              <option value="">Duration</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 hour</option>
            </select>
          </div>
          <div className="flex justify-center gap-6 mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#008080] text-white px-12 py-3 rounded-xl font-semibold text-lg hover:bg-[#004d4d] transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              disabled={loading}
              className="border-2 border-[#D90429] text-[#D90429] px-12 py-3 rounded-xl font-semibold text-lg bg-white hover:bg-[#ffeaea] transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 