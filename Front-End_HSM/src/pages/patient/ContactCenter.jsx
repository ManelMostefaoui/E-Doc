import { Search } from "lucide-react"
import { useState, useEffect } from "react"
import ContactForm from "../../components/CPatient/ContactForm"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function ContactCenter() {
  const navigate = useNavigate()
  const [showContactForm, setShowContactForm] = useState(false)
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmingId, setConfirmingId] = useState(null)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        const response = await axios.get('http://127.0.0.1:8000/api/consultations/user', {
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

    fetchConsultations()
  }, [])

  const handleConfirmAppointment = async (consultationId) => {
    if (!consultationId) {
      setError('Invalid consultation ID')
      return
    }

    const consultationToConfirm = consultations.find(c => c.id === consultationId);

    if (!consultationToConfirm || !consultationToConfirm.appointment_id) {
      setError('Appointment details not found for this consultation.');
      return;
    }

    const appointmentId = consultationToConfirm.appointment_id;

    try {
      setConfirmingId(consultationId)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await axios.put(
        `http://127.0.0.1:8000/api/appointments/${appointmentId}/confirm`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data) {
        // Update the consultation status in the local state
        setConsultations(prevConsultations =>
          prevConsultations.map(consultation =>
            consultation.id === consultationId
              ? { ...consultation, status: 'confirmed' }
              : consultation
          )
        )
      }
    } catch (err) {
      console.error('Failed to confirm appointment:', err)
      setError(err.response?.data?.message || err.message || 'Failed to confirm appointment')
    } finally {
      setConfirmingId(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredConsultations = consultations.filter((consultation) =>
    consultation.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex flex-col">
          <h1 className="text-2xl text-left font-bold text-[#008080] mb-6">Contact center :</h1>

          <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="ml-4 h-5 w-5 text-gray-400" />
              </div>

              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 pr-4 py-2 w-full md:w-90 rounded-lg bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowContactForm(true)}
              className="text-[#f7f9f9] bg-[#008080] font-semibold flex items-center gap-4 border-2 border-[#008080] rounded-lg px-13 py-2 hover:bg-[#006666] transition duration-150"
            >
              Contact the doctor
            </button>
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

        {/* Consultations list */}
        {!loading && !error && (
          <div className="text-left space-y-4">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] rounded-lg p-10 space-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-gray-600 text-[13px] mb-1">
                      {formatDate(consultation.created_at)}
                    </div>
                    <div className="font-medium text-[#1a1a1a] mb-2">
                      Status: <span className={`capitalize ${consultation.status === 'pending' ? 'text-yellow-600' : consultation.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                  {consultation.status === 'scheduled' && (
                    <button
                      onClick={() => handleConfirmAppointment(consultation.id)}
                      disabled={confirmingId === consultation.id}
                      className={`px-6 py-2 rounded-lg font-semibold text-sm ${confirmingId === consultation.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#008080] hover:bg-[#006666] text-white'
                        } transition-colors`}
                    >
                      {confirmingId === consultation.id ? 'Confirming...' : 'Confirm Appointment'}
                    </button>
                  )}
                </div>
                <div className="whitespace-pre-line text-[#1a1a1a]">{consultation.message}</div>
                {consultation.appointment_date && (
                  <div className="mt-4 text-[#008080] font-medium">
                    Scheduled for: {formatDate(consultation.appointment_date)}
                  </div>
                )}
              </div>
            ))}
            {filteredConsultations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No consultations found
              </div>
            )}
          </div>
        )}
      </div>
      {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
    </>
  )
}