"use client"

import { ChevronDown, X } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

export default function AppointmentForm({ onClose, selectedPatient }) {
  const now = new Date()

  const [formData, setFormData] = useState({
    date: now.toISOString().split("T")[0],
    time: now.toTimeString().slice(0, 5),
    duration: "",
    patientId: "", // Changed from fullName to patientId
  })

  const [errors, setErrors] = useState({})
  const [patients, setPatients] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');

  // Fetch patients from API
  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true)
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://127.0.0.1:8000/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        console.log('Fetched patients:', response.data)
        setPatients(response.data)
      } catch (error) {
        console.error('Error fetching patients:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
        }
      } finally {
        setLoadingPatients(false)
      }
    }

    // Fetch patients only if a selectedPatient prop is NOT provided, allowing manual selection
    if (!selectedPatient) {
      fetchPatients()
    }

  }, [selectedPatient]) // Re-run if selectedPatient changes

  // Effect to pre-fill patient field if selectedPatient prop is provided
  useEffect(() => {
    if (selectedPatient && selectedPatient.id) {
      setFormData(prev => ({
        ...prev,
        patientId: String(selectedPatient.id), // Store ID as string
      }));
      setSelectedPatientName(selectedPatient.name || ''); // Pre-fill with patient's name
      setShowPatientDropdown(false); // Hide dropdown when patient is pre-selected
    }
  }, [selectedPatient]); // Run this effect when selectedPatient prop changes

  const handleChange = (field, value) => {
    if (field === 'patientId') {
      setPatientSearchTerm(value);
      setShowPatientDropdown(true);
      // Don't update formData.patientId while searching
      return;
    }

    setFormData({
      ...formData,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate patientId: check if it's present and its string representation is not empty after trimming
    if (!String(formData.patientId || '').trim()) {
      newErrors.patientId = "Patient is required"; // Changed message for clarity
    }
    if (!formData.duration) {
      newErrors.duration = "Duration is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem('token')
        const response = await axios.post('http://127.0.0.1:8000/api/appointments/create-direct', {
          patient_id: formData.patientId, // Use patientId for the POST request
          date: formData.date,
          time: formData.time,
          duration: parseInt(formData.duration) // Ensure duration is a number
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        console.log('Appointment created:', response.data)
        setSuccessMessage('Appointment created successfully!');
        // Optionally close modal after a delay
        setTimeout(() => {
          onClose()
        }, 2000); // Close after 2 seconds
      } catch (error) {
        console.error('Error creating appointment:', error)
        // Handle error, maybe set an errorMessage state
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  const renderField = (label, field, type, options) => {
    return (
      <div className="space-y-2">
        <label className="block text-[#1A1A1A] font-medium">{label}</label>
        {type === "input" ? (
          <input
            type={field === "date" ? "date" : field === "time" ? "time" : "text"}
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all ${errors[field] ? "border-red-500" : "border-gray-300"
              }`}
            placeholder={field === "patientId" ? "Select patient" : ""}
          />
        ) : (
          <div className="relative">
            <select
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all ${errors[field] ? "border-red-500" : "border-gray-300"
                }`}
              disabled={field === "patientId" && loadingPatients}
            >
              <option value="">
                {field === "patientId"
                  ? (loadingPatients ? "Loading patients..." : "Select patient")
                  : `Select ${label.toLowerCase().replace(":", "")}`
                }
              </option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        )}
        {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
      </div>
    )
  }

  const patientOptions = patients.map((patient, index) => {
    let patientName = ''
    if (patient.name) {
      patientName = patient.name
    } else if (patient.first_name && patient.last_name) {
      patientName = `${patient.first_name} ${patient.last_name}`
    } else if (patient.full_name) {
      patientName = patient.full_name
    } else if (patient.firstName && patient.lastName) {
      patientName = `${patient.firstName} ${patient.lastName}`
    } else {
      patientName = `Patient ${patient.id || index + 1}`
    }

    return {
      value: patient.id, // Ensure the value is the patient ID
      label: patientName
    }
  })

  const filteredPatients = patients.filter(p => {
    const name = p.user?.name || '';
    return name.toLowerCase().includes(patientSearchTerm.toLowerCase());
  });

  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: String(patient.id), // Store patient ID as a string for form handling/validation
    }));

    setSelectedPatientName(patient.user?.name || '');
    setPatientSearchTerm(patient.user?.name || '');
    setShowPatientDropdown(false);
    setErrors({ ...errors, patientId: '' });
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[#f7f9f9] rounded-xl shadow-[2px_2px_12px_rgba(0,0,0,0.25)] w-full max-h-[90vh] max-w-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center py-6 px-8">
          <h2 className="font-bold text-[28px] text-[#008080] flex-grow text-center">Add New Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-8 text-center text-[#1A1A1A] text-[16px] mb-6">
          <p>
            Fill in the details below to schedule a new appointment. Make sure all fields are accurate before saving, so
            your patient records stay up to date.
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 mx-8 text-sm">
            {successMessage}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-8 py-2">
          <div className="space-y-6">
            {renderField("Date:", "date", "input")}

            {renderField("Time:", "time", "input")}

            {renderField("Duration (minutes):", "duration", "select", [
              { value: "15", label: "15 minutes" },
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60 minutes" },
            ])}

            {/* Patient selection field */}
            <div className="space-y-2">
              <label className="block text-[#1A1A1A] font-medium">Patient:</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedPatient ? selectedPatient.name : patientSearchTerm}
                  onChange={(e) => handleChange('patientId', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all ${errors.patientId ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Search patient..."
                  disabled={!!selectedPatient} // Disable if patient is pre-selected
                />
                {showPatientDropdown && !selectedPatient && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePatientSelect(patient)}
                      >
                        {patient.user?.name || `Patient ${patient.id}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.patientId && <p className="text-red-500 text-sm mt-1">{errors.patientId}</p>}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 p-8">
          <button
            onClick={handleSave}
            className="text-white bg-[#008080] font-semibold border-2 border-[#008080] rounded-lg px-8 py-3 hover:bg-[#006666] transition-colors duration-150"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Appointment'}
          </button>
          <button
            onClick={onClose}
            className="text-[#C5283D] bg-[#F7F9F9] border-2 font-semibold border-[#C5283D] rounded-lg px-8 py-3 hover:text-[#F7F9F9] hover:bg-[#C5283D] transition-colors duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
