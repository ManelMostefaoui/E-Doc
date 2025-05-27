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

// Define the same categories list as in PatientProfile.jsx for clinical data rendering
const categories = [
  { value: "respiratory_diseases", label: "Respiratory Diseases" },
  { value: "heart_and_vascular_diseases", label: "Heart and Vascular Diseases" },
  { value: "digestive_system_diseases", label: "Digestive System Diseases" },
  { value: "endocrine_diseases", label: "Endocrine Diseases" },
  { value: "reproductive_system_diseases", label: "Reproductive System Diseases" },
  { value: "blood_disorders", label: "Blood Disorders" },
  { value: "urinary_tract_and_kidney_diseases", label: "Urinary Tract and Kidney Diseases" },
  { value: "skin_diseases", label: "Skin Diseases" },
  { value: "ent_diseases", label: "ENT Diseases" },
  { value: "eye_diseases", label: "Eye Diseases" },
  { value: "neurological_and_mental_disorders", label: "Neurological and Mental Disorders" },
  { value: "rheumatic_diseases", label: "Rheumatic Diseases" },
  { value: "cancers", label: "Cancers" },
];

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

  // Add new state for detailed patient information
  const [medicalHistory, setMedicalHistory] = useState({});
  const [personalHistory, setPersonalHistory] = useState({});
  const [clinicalData, setClinicalData] = useState({}); // For height, weight, and health issues

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

      // We will now fetch all detailed data in handlePatientSelect, so this useEffect might become redundant
      // Keep it for now in case it's used elsewhere or for initial load of basic vitals if no selectedPatient prop
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/api/patient-vitals/show/${patientVitals.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        })

        if (response.data) {
          // Only update specific vital fields here to avoid overwriting detailed data fetched in handlePatientSelect
           setPatientVitals(prev => ({
             ...prev,
             bloodPressure: response.data.bloodPressure || "",
             temperature: response.data.temperature || "",
             heartRate: response.data.heartRate || "",
             bloodSugar: response.data.bloodSugar || "",
             observations: response.data.observations || "",
           }));
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

    // Fetch detailed patient information after selecting a patient
    if (patient.id) {
      fetchMedicalHistory(patient.id);
      fetchPersonalHistory(patient.id);
      fetchClinicalData(patient.id);
    }
  };

  // Define fetch functions for detailed patient information

  const fetchMedicalHistory = async (patientId) => {
    if (!patientId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/patients/${patientId}/medical-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const medicalHistoryData = response.data?.data;
      if (medicalHistoryData && Array.isArray(medicalHistoryData)) {
         const categorizedHistory = { // Categorize data similar to PatientProfile.jsx
            congenital_conditions: [],
            general_diseases: [],
            surgical_interventions: [],
            allergic_reactions: [],
          };

          medicalHistoryData.forEach(item => {
            const conditionText = item.condition ? item.condition.toLowerCase() : '';
            if (conditionText.includes('congenital') || conditionText.includes('birth defect')) {
              categorizedHistory.congenital_conditions.push(item);
            } else if (conditionText.includes('allergy') || conditionText.includes('allergic')) {
              categorizedHistory.allergic_reactions.push(item);
            } else if (conditionText.includes('surgery') || conditionText.includes('surgical')) {
              categorizedHistory.surgical_interventions.push(item);
            } else {
              categorizedHistory.general_diseases.push(item);
            }
          });
          setMedicalHistory(categorizedHistory);
      } else {
           setMedicalHistory({
            congenital_conditions: [],
            general_diseases: [],
            surgical_interventions: [],
            allergic_reactions: [],
          });
      }

    } catch (err) {
      console.error("Failed to fetch medical history:", err);
      setMedicalHistory({}); // Clear medical history on error
    }
  };

  const fetchPersonalHistory = async (patientId) => {
    if (!patientId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/personal-history/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

       if (response.data) {
          // Convert fields to match backend field names and set state
          setPersonalHistory({
            ...response.data,
            smoker: response.data.smoker === true || response.data.smoker === 1 ? "Yes" : 
                    response.data.smoker === false || response.data.smoker === 0 ? "No" : "Empty",
            cigarette_count: response.data.cigarette_count ?? "Empty",
            chewing_tobacco: response.data.chewing_tobacco === true || response.data.chewing_tobacco === 1 ? "Yes" : 
                            response.data.chewing_tobacco === false || response.data.chewing_tobacco === 0 ? "No" : "Empty",
            chewing_tobacco_count: response.data.chewing_tobacco_count ?? "Empty",
            first_use_age: response.data.first_use_age ?? "Empty",
            former_smoker: response.data.former_smoker === true || response.data.former_smoker === 1 ? "Yes" : 
                          response.data.former_smoker === false || response.data.former_smoker === 0 ? "No" : "Empty",
            exposure_period: response.data.exposure_period ?? "Empty",
            alcohol: response.data.alcohol ?? "Empty",
            medications: response.data.medications ?? "Empty",
            other: response.data.other ?? "Empty"
          });
        } else {
           setPersonalHistory({}); // Clear personal history if no data
        }
    } catch (err) {
      console.error("Failed to fetch personal history:", err);
      setPersonalHistory({}); // Clear personal history on error
    }
  };

  const fetchClinicalData = async (patientId) => {
    if (!patientId) return;
    console.log('Fetching clinical data for patient ID:', patientId);
    try {
      const token = localStorage.getItem('token');

      // Fetch patient data for height and weight
       const patientResponse = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      console.log('Patient data response:', patientResponse.data);
      const clinicalDataFromPatient = patientResponse.data || {};

      // Fetch screenings for health issues
      const screeningsResponse = await axios.get(`http://127.0.0.1:8000/api/Screening/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      console.log('Screenings data response:', screeningsResponse.data);
      const screeningsData = Array.isArray(screeningsResponse.data) ? screeningsResponse.data : [];

      // Combine and map data to clinicalData state
      let updatedClinicalData = {
        height: clinicalDataFromPatient.height || "",
        weight: clinicalDataFromPatient.weight || "",
        // Initialize health issue fields
        respiratory_diseases: "",
        heart_and_vascular_diseases: "",
        digestive_system_diseases: "",
        endocrine_diseases: "",
        reproductive_system_diseases: "",
        blood_disorders: "",
        urinary_tract_and_kidney_diseases: "",
        skin_diseases: "",
        ent_diseases: "",
        eye_diseases: "",
        neurological_and_mental_disorders: "",
        rheumatic_diseases: "",
        cancers: "",
        respiratory_diseases_notes: "",
        heart_and_vascular_diseases_notes: "",
        digestive_system_diseases_notes: "",
        endocrine_diseases_notes: "",
        reproductive_system_diseases_notes: "",
        blood_disorders_notes: "",
        urinary_tract_and_kidney_diseases_notes: "",
        skin_diseases_notes: "",
        ent_diseases_notes: "",
        eye_diseases_notes: "",
        neurological_and_mental_disorders_notes: "",
        rheumatic_diseases_notes: "",
        cancers_notes: "",
      };

       screeningsData.forEach(screening => {
        const category = screening.category;
        const type = screening.type;
        const result = screening.result; // Assuming result contains the notes

         if (updatedClinicalData.hasOwnProperty(category)) {
          updatedClinicalData[category] = type || "";
          const notesField = `${category}_notes`;
          if (updatedClinicalData.hasOwnProperty(notesField)) {
            updatedClinicalData[notesField] = result || "";
          }
        }
      });

      console.log('Updated clinical data before setting state:', updatedClinicalData);
      setClinicalData(updatedClinicalData);

    } catch (err) {
      console.error("Failed to fetch clinical data:", err);
      setClinicalData({}); // Clear clinical data on error
    }
  };

  const handleSaveVitals = async () => {
    if (!patientVitals.id) {
      alert("Please select a patient first!")
      return
    }

    // Validate required fields
    if (!clinicalData.height || !clinicalData.weight) {
      alert("Height and weight are required fields!")
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/patient-vitals/store', {
        patient_id: patientVitals.id,
        vital_date: patientVitals.date,
        height: parseInt(clinicalData.height),
        weight: parseInt(clinicalData.weight),
        blood_pressure: patientVitals.bloodPressure ? parseInt(patientVitals.bloodPressure) : null,
        temperature: patientVitals.temperature ? parseInt(patientVitals.temperature) : null,
        heart_rate: patientVitals.heartRate ? parseInt(patientVitals.heartRate) : null,
        blood_sugar: patientVitals.bloodSugar ? parseInt(patientVitals.bloodSugar) : null,
        other_observations: patientVitals.observations || null
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      alert("Patient vitals saved successfully!")
    } catch (error) {
      console.error("Error saving patient vitals:", error)
      // Show more detailed error message from the server if available
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
      alert("Failed to save patient vitals: " + errorMessage)
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
              <span className="form-input bg-gray-50 flex items-center text-gray-700">{patientVitals.age || 'N/A'}</span>
            </div>
          </div>
          {/* Height and Weight display (fetched clinical data) */}
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="form-label">Height :</label>
              <div className="relative">
                  <span className="form-input bg-gray-50 flex items-center text-gray-700">{clinicalData.height || 'Empty'} cm</span>
              </div>
          </div>
           <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="form-label">Weight :</label>
              <div className="relative">
                  <span className="form-input bg-gray-50 flex items-center text-gray-700">{clinicalData.weight || 'Empty'} kg</span>
              </div>
          </div>
          {/* Editable input fields for other vitals */}
          {inputFields.map((label, index) => {
            const fieldName = label.toLowerCase().replace(/\s+/g, '')
             // Exclude Height and Weight from this mapping as they are displayed separately
             if (fieldName === 'height' || fieldName === 'weight') {
                 return null;
             }
            return (
              <div key={index} className="grid grid-cols-[120px_1fr] items-center gap-4">
                <label className="form-label">{label} :</label>
                <div className="relative">
                  <input
                    type="text"
                    name={fieldName}
                    value={patientVitals[fieldName] || ''} // Use patientVitals for editable fields
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
        {/* Move Save button here and remove Cancel button */}
        <div className="flex gap-4 mt-4">
          <button 
            onClick={handleSaveVitals}
            className="bg-[#008080] hover:bg-primary-dark text-white px-6 py-2 rounded-md text-sm font-medium w-40 transition-colors"
          >
            Save Vitals
          </button>
        </div>
      </section>

      {/* Medical Prescription */}
      <EsiForm selectedPatient={patientVitals} />
      
      {/* Upload Documents */}
      <UploadDocuments patientId={patientVitals.id} /> {/* Pass patientId to UploadDocuments */}
    </div>
  )
}
