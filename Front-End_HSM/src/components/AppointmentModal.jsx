import React from "react"
import { Pencil } from "lucide-react"

export default function AppointmentModal({ isOpen, onClose, initialData }) {
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
        <form className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Date :</label>
            <input type="date" className="border border-[#008080] rounded-lg px-4 py-2 w-full" placeholder="Date" />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Time :</label>
            <input type="time" className="border border-[#008080] rounded-lg px-4 py-2 w-full" placeholder="Time" />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Duration :</label>
            <select className="border border-[#008080] rounded-lg px-4 py-2 w-full">
              <option value="">Duration</option>
              <option value="15 min">15 min</option>
              <option value="30 min">30 min</option>
              <option value="45 min">45 min</option>
              <option value="1 hour">1 hour</option>
            </select>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Full name :</label>
            <div className="relative">
              <input type="text" className="border border-[#008080] rounded-lg px-4 py-2 w-full pr-10" placeholder="Full name" />
              <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="text-gray-700">Gender :</label>
            <select className="border border-[#008080] rounded-lg px-4 py-2 w-full">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="flex justify-center gap-6 mt-8">
            <button type="submit" className="bg-[#008080] text-white px-12 py-3 rounded-xl font-semibold text-lg hover:bg-[#004d4d] transition-colors">Save</button>
            <button type="button" className="border-2 border-[#D90429] text-[#D90429] px-12 py-3 rounded-xl font-semibold text-lg bg-white hover:bg-[#ffeaea] transition-colors" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
} 