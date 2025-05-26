import { useRef, useState, useEffect } from "react"
import { ChevronDown, Pencil, Printer, Trash2, Upload, FileText, Search } from "lucide-react"
import { EsiLogo, EsiText } from "../assets"
import EsiForm from "./EsiForm"
import UploadDocuments from "./UploadDocuments"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import Ordonnance from "./ordonnance"
import axios from "axios"

// Configure axios base URL
axios.defaults.baseURL = 'http://127.0.0.1:8000'

export default function ConsultationForm({ selectedPatient }) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const ordonnanceRef = useRef(null)
  const [patientVitals, setPatientVitals] = useState({
    fullName: "",
    age: "",
    height: "",
    weight: "",
    bloodPressure: "",
    temperature: "",
    heartRate: "",
    bloodSugar: "",
    observations: "",
    date: new Date().toISOString().split('T')[0]
  })

  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [errorLoadingPatients, setErrorLoadingPatients] = useState(null);

  // Calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return ''
    const birth = new Date(birthdate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  // Effect to update patient vitals when selectedPatient prop changes (initial load from profile)
  useEffect(() => {
    if (selectedPatient) {
      setPatientVitals(prev => ({
        ...prev,
        fullName: selectedPatient.name || "",
        age: selectedPatient.birthdate ? calculateAge(selectedPatient.birthdate) : "",
        height: selectedPatient.height || "",
        weight: selectedPatient.weight || ""
      }))
    }
  }, [selectedPatient])

  // Effect to fetch patient vitals when a patient is selected (from search suggestions)
  useEffect(() => {
    const fetchPatientVitals = async () => {
      if (!patientVitals.id) return; // Only fetch if a patient with an ID is in patientVitals (selected from search)

      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/api/patient-vitals/show/${patientVitals.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })
        
        if (response.data) {
          setPatientVitals(prev => ({
            ...prev,
            ...response.data
          }))
        }
      } catch (error) {
        console.error("Error fetching patient vitals after selection:", error)
        // Optionally display an error to the user
      }
    }

    fetchPatientVitals()
  }, [patientVitals.id]) // Trigger when the ID in patientVitals changes (after selecting a patient)

  // Effect to fetch patients when search query (fullName) changes
  useEffect(() => {
    const fetchPatients = async () => {
      const query = patientVitals.fullName; // Use the value from the input
      if (!query) { // Trigger search even with one character
        setPatientSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingPatients(true);
      setErrorLoadingPatients(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setErrorLoadingPatients("Authentication token not found. Please log in.");
          setLoadingPatients(false);
          setPatientSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        const response = await axios.get('/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.data && Array.isArray(response.data)) {
          // Filter patients by full name including the search query (case-insensitive)
          const filteredPatients = response.data.filter(patient =>
            patient.user && patient.user.name && patient.user.name.toLowerCase().includes(query.toLowerCase())
          );
          setPatientSuggestions(filteredPatients);
          setShowSuggestions(filteredPatients.length > 0);
        } else {
          setErrorLoadingPatients("Unexpected data format from server.");
          setPatientSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        let errorMessage = "Failed to load patients. ";
        if (error.response) {
          errorMessage += `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
          errorMessage += "No response from server. Please check your internet connection.";
        } else {
          errorMessage += error.message || 'Unknown error occurred';
        }
        setErrorLoadingPatients(errorMessage);
        setPatientSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoadingPatients(false);
      }
    };

    // Simple debouncing: wait 300ms after typing stops before searching
    const timerId = setTimeout(() => {
      fetchPatients();
    }, 300);

    // Cleanup function to clear the timer if fullName changes before the timeout
    return () => {
      clearTimeout(timerId);
    };

  }, [patientVitals.fullName]); // Re-run effect when fullName in patientVitals changes

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPatientVitals(prev => ({
      ...prev,
      [name]: value
    }))
    // If the input is the full name, show suggestions
    if (name === 'fullName') {
      setShowSuggestions(true); // Show suggestions as user types in the full name field
    }
  }

  const handlePatientSelect = (patient) => {
    // Update patientVitals with the selected patient's information
    setPatientVitals(prev => ({
      ...prev,
      id: patient.id, // Patient ID
      fullName: patient.user?.name || "", // Name from nested user object
      age: patient.user?.birthdate ? calculateAge(patient.user.birthdate) : "", // Age from nested user birthdate
      height: patient.height || "", // Assuming height is directly on patient object
      weight: patient.weight || "", // Assuming weight is directly on patient object
      // Keep other vital information as they might have been entered manually or fetched separately
    }));
    setShowSuggestions(false); // Hide suggestions after selection
  };

  const handleSaveVitals = async () => {
    if (!patientVitals.id) {
      alert("Please select a patient first!")
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/patient-vitals/store', {
        patient_id: patientVitals.id,
        ...patientVitals,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      alert("Patient vitals saved successfully!")
    } catch (error) {
      console.error("Error saving patient vitals:", error)
      alert("Failed to save patient vitals")
    }
  }

  const inputFields = [
    "Height",
    "Weight",
    "Blood pressure",
    "Temperature",
    "Heart rate",
    "Blood sugar",
    "Observations",
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#008080] mb-6">Consultation :</h1>

      {/* Patient Vitals & Information */}
      <section className="form-section">
        <h2 className="form-section-title text-[#004D4D] font-bold text-3xl">Patient vitals & informations :</h2>
        <div className="grid grid-cols-1 gap-4 mt-5">
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="form-label">Date :</label>
            <div className="relative">
              <span className="flex items-center text-gray-700">{patientVitals.date}</span>
            </div>
          </div>
          {/* Patient Selection - Full Name Input with Suggestions */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="form-label">Full name :</label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={patientVitals.fullName}
                onChange={handleInputChange}
                placeholder="Enter patient full name"
                className="form-input w-full pr-10"
              />
              {loadingPatients && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  Loading...
                </div>
              )}
              {errorLoadingPatients && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                  Error
                </div>
              )}
              {showSuggestions && patientSuggestions.length > 0 && patientVitals.fullName.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                  {patientSuggestions.map((patient) => (
                    <li
                      key={patient.id} // Assuming patient object has an 'id'
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      {patient.user?.name} ({patient.user?.birthdate ? new Date(patient.user.birthdate).getFullYear() : 'N/A'})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Age display (non-editable) */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <label className="form-label">Age :</label>
            <div className="relative">
              <span className="form-input bg-gray-50 flex items-center text-gray-700">{patientVitals.age}</span>
            </div>
          </div>
          {inputFields.map((label, index) => {
            const fieldName = label.toLowerCase().replace(/\s+/g, '')
            return (
              <div key={index} className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="form-label">{label} :</label>
                <div className="relative">
                  <input
                    type="text"
                    name={fieldName}
                    value={patientVitals[fieldName]}
                    onChange={handleInputChange}
                    placeholder={label}
                    className="form-input pr-10"
                  />
                  {/* Removed Pencil icon as it doesn't seem to have functionality here */}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Medical Prescription */}
      <EsiForm selectedPatient={patientVitals} /> {/* Pass patientVitals which now includes selected patient info */}
      
      {/* Upload Documents */}
      <UploadDocuments />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button 
          onClick={handleSaveVitals}
          className="bg-[#008080] hover:bg-primary-dark text-white px-6 py-2 rounded-md text-sm font-medium w-40 transition-colors"
        >
          Save
        </button>
        <button className="border border-red-500 bg-white text-red-700 hover:bg-red-600 hover:text-white w-40 px-6 py-2 rounded-md text-sm font-medium transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
