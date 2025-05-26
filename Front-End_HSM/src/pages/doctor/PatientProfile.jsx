import Editbtn from "../../components/CDoctor/Editbtn"
import FileUpload from "../../components/CDoctor/FileUpload"
import BasicInfosForm from "../../components/CDoctor/BasicInfosForm"
import ClinicalForm from "../../components/CDoctor/ClinicalForm"
import PersonalHistoryForm from "../../components/CDoctor/PersonalHistoryForm"
import MedicalHistoryModal from "../../components/CDoctor/MedicalHistoryModal"
import {
  Calendar,
  Download,
  Edit,
  FileText,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  Mail,
  Shield,
  Droplet,
  Trash
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

// Define the same categories list as in ClinicalForm.jsx
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

export default function PatientProfile() {
  const [showBasicInfosForm, setShowBasicInfosForm] = useState(false)
  const [showClinicalForm, setShowClinicalForm] = useState(false)
  const [showPersonalHistoryForm, setShowPersonalHistoryForm] = useState(false)
  const [showMedicalHistoryModal, setShowMedicalHistoryModal] = useState(false)
  const { id: patientId } = useParams();
  const [patient, setPatient] = useState({});
  const [personalHistory, setPersonalHistory] = useState({});
  const [medicalHistory, setMedicalHistory] = useState({});
  const [clinicalData, setClinicalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Define fetchMedicalHistory outside of useEffect to make it accessible
  const fetchMedicalHistory = async () => {
    console.log('fetchMedicalHistory called');
    if (!patientId) return;
    
    try {
      setLoading(true); // Set loading true before fetching
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}/medical-history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Raw medical history data from API:', response.data);

      // Access the array of medical history items from response.data.data
      const medicalHistoryData = response.data?.data;

      if (medicalHistoryData && Array.isArray(medicalHistoryData)) {
        // Process the flat array and categorize the medical history
        const categorizedHistory = {
          congenital_conditions: [],
          general_diseases: [],
          surgical_interventions: [],
          allergic_reactions: [],
        };

        medicalHistoryData.forEach(item => {
          const conditionText = item.condition ? item.condition.toLowerCase() : '';
          // Basic categorization based on keywords - may need refinement based on actual data
          if (conditionText.includes('congenital') || conditionText.includes('birth defect')) {
            categorizedHistory.congenital_conditions.push(item);
          } else if (conditionText.includes('allergy') || conditionText.includes('allergic')) {
            categorizedHistory.allergic_reactions.push(item);
          } else if (conditionText.includes('surgery') || conditionText.includes('surgical')) {
            categorizedHistory.surgical_interventions.push(item);
          } else {
            // Default to general diseases if no specific keyword found
            categorizedHistory.general_diseases.push(item);
          }
        });

        setMedicalHistory(categorizedHistory);
      } else {
         // Handle unexpected response format or empty data if necessary
         setMedicalHistory({
          congenital_conditions: [],
          general_diseases: [],
          surgical_interventions: [],
          allergic_reactions: [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch medical history:", err);
      // Optionally set an error state for the user
    } finally {
      setLoading(false); // Set loading false after fetching is complete
    }
  };

  // Define fetchClinicalAndScreeningData outside of useEffect
  const fetchClinicalAndScreeningData = async () => {
    console.log('fetchClinicalAndScreeningData called');
    if (!patientId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch basic clinical data (height, weight, etc.)
      const patientResponse = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log('Patient data from /api/patients/{id}:', patientResponse.data);
      const clinicalDataFromPatient = patientResponse.data || {};

      // Fetch screenings
      const screeningsResponse = await axios.get(`http://127.0.0.1:8000/api/Screening/${patientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log('Screenings data from /api/Screening/{id}:', screeningsResponse.data);
      // Use the response data directly, assuming it's the array
      const screeningsData = Array.isArray(screeningsResponse.data) ? screeningsResponse.data : [];

      // Initialize clinicalData state with basic data and empty health issues/notes
      let updatedClinicalData = {
        height: clinicalDataFromPatient.height || "",
        weight: clinicalDataFromPatient.weight || "",
        // Initialize all health issue fields and notes to empty
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
        endocrine_diseases_notes: "", // Fixed typo
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

      console.log('Initial updatedClinicalData state:', updatedClinicalData);

      // Process screenings data and update clinicalData
      screeningsData.forEach(screening => {
        const category = screening.category;
        const type = screening.type;
        const result = screening.result; // Assuming result contains the notes

        console.log('Processing screening item:', { category, type, result });

        // Special handling for measurements - Assuming measurements are returned directly in the patient data, not screenings
        // Remove this block as measurements are not screenings
        // if (category === "measurements") {
        //     if (type === "height") {
        //         updatedClinicalData.height = result || "";
        //     } else if (type === "weight") {
        //         updatedClinicalData.weight = result || "";
        //     }
        // } else

         if (updatedClinicalData.hasOwnProperty(category)) {
          // Handle other health issue categories
          // We assume the GET /Screening endpoint returns the latest or all.
          // We are now overwriting the field for simplicity if multiple entries per category.
          updatedClinicalData[category] = type || "";
          // Map result to the corresponding notes field
          const notesField = `${category}_notes`;
          if (updatedClinicalData.hasOwnProperty(notesField)) {
            updatedClinicalData[notesField] = result || "";
          }
        }
      });

      console.log('Final updatedClinicalData state before setting:', updatedClinicalData);
      setClinicalData(updatedClinicalData);
      setError(""); // Clear any previous errors

    } catch (err) {
      console.error("Failed to fetch clinical data and screenings:", err);
      setError("Failed to load health and clinical data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of patient data
    const fetchPatientData = async () => {
      if (!patientId) return;

      try {
        setLoading(true); // Set loading true before fetching
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Patient data:', response.data);
        setPatient(response.data);
        // Update clinicalData with height and weight fetched here
        setClinicalData(prevData => ({
            ...prevData,
            height: response.data.height || "",
            weight: response.data.weight || "",
        }));
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError("Failed to load patient data. Please try again.");
      } finally {
        // Note: setLoading(false) is also handled in fetchClinicalAndScreeningData
        // Consider if you need separate loading states or a combined one
      }
    };

    fetchPatientData();
    fetchMedicalHistory(); // Call the function defined outside useEffect
    fetchClinicalAndScreeningData(); // Fetch combined clinical and screening data

  }, [patientId]); // Dependency array ensures this runs when patientId changes

  useEffect(() => {
    const fetchPersonalHistory = async () => {
      if (!patientId) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/personal-history/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.data) {
          // Convert fields to match backend field names
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
        }
      } catch (err) {
        console.error("Failed to fetch personal history:", err);
      }
    };
    
    fetchPersonalHistory();
  }, [patientId]);

  const handleBasicInfoSave = (updatedData) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      SSN: updatedData.SSN,
      blood_type: updatedData.blood_type
    }));
  };

  const handlePersonalHistorySave = (updatedData) => {
    setPersonalHistory(prevHistory => ({
      ...prevHistory,
      ...updatedData
    }));
  };

  const handleMedicalHistorySave = (updatedData) => {
    console.log('handleMedicalHistorySave triggered');
  };

  const handleClinicalDataSave = (updatedData) => {
    setClinicalData(prevData => ({
      ...prevData,
      ...updatedData
    }));
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
    );
  }

  return (
    <>
    <div className="space-y-6">

      {/* Patient header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="p-0.5 w-20 h-20 rounded-full overflow-hidden border-4 border-[#008080]">
          <img src={patient.picture || "/prfl.jpg"} alt="Patient profile" className="w-full h-full object-cover rounded-full" />
        </div>

        <div className="space-y-4 flex-1">
          <h1 className="font-nunito text-[20px] text-[#1a1a1a] font-semibold">{patient.name || "Patient Name"}</h1>
          <p className="font-nunito text-[20px] text-[#495057]">{patient.role || "Patient"}</p>
        </div>

        <button
          onClick={() => navigate('/consultation', { state: { selectedPatient: patient } })}
          className="bg-[#008080] hover:bg-[#006666] text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Start Consultation
        </button>
      </div>

      {/* Information cards - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Basic information */}
        <div className="px-10 py-8 bg-gradient-to-b from-[#F7F9F9] to-[#A7E8E8] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">

          <div className="flex justify-between items-center ">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Basic informations</h2>
            <Editbtn onClick={() => setShowBasicInfosForm(true)}  text="Edit Basic infos" />
          </div>

          <div className="py-4">
            <div className="space-y-6">

              <div className="flex items-start gap-6">
                <User size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Gender :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.gender || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Calendar size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Date and birthday place :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.birthdate || "Not specified"} {patient.birthplace || ""}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Phone size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Phone number :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.phone_num || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Mail size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Email :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.email || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Shield size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Social security number :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.social_security_no || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Droplet size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Blood type :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.blood_group || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <MapPin size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Address :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.address || "Not specified"}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Personal History */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">
              Personal History
            </h2>
            <Editbtn onClick={() => setShowPersonalHistoryForm(true)} /> 
          </div>

          <div className="font-nunito text-[16px] text-[#1A1A1A] py-6">
            <div className="space-y-6 py-3">
              <div className="space-y-6 py-3">
                <div>
                  <p className="text-[#495057]">Tobacco :</p>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 ">
                      <p className="font-semibold">Smoking : <span className="font-normal">{personalHistory.smoker || "Empty"}</span></p>
                      <p className="font-semibold">Cigarettes per day : <span className="font-normal">{personalHistory.cigarette_count || "Empty"}</span></p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ">
                      <p className="font-semibold">Chewing tobacco : <span className="font-normal">{personalHistory.chewing_tobacco || "Empty"}</span></p>
                      <p className="font-semibold">Number of boxes : <span className="font-normal">{personalHistory.chewing_tobacco_count || "Empty"}</span></p>
                    </div>
                    <p className="font-semibold">Other forms : <span className="font-normal">{personalHistory.other || "Empty"}</span></p>
                    <p className="font-semibold">Age at first use : <span className="font-normal">{personalHistory.first_use_age || "N/A"}</span></p>
                    <div className="grid grid-cols-2 gap-2 ">
                      <p className="font-semibold">Former smoker : <span className="font-normal">{personalHistory.former_smoker || "Empty"}</span></p>
                      <p className="font-semibold">Quit date : <span className="font-normal">{personalHistory.quit_date || "N/A"}</span></p>
                    </div>
                  </div>
                </div>
                <div className="font-nunito text-[16px] text-[#1A1A1A] space-y-4 py-5">
                  <p className="text-[#495057]">Alcohol :</p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <p className="font-semibold">Consumption : <span className="font-normal">{personalHistory.alcohol || "Empty"}</span></p>
                    <p className="font-semibold">Period of exposure : <span className="font-normal">{personalHistory.exposure_period || "N/A"}</span></p>
                  </div>
                </div>
                <div className="font-nunito text-[16px] text-[#1A1A1A] space-y-4">
                  <p className="text-[#495057]">Medications :</p>
                  <p className="mt-4 font-semibold">Current medications : <span className="font-normal">{personalHistory.medications || "Empty"}</span></p>
                  <p className="font-semibold mt-2">Past medications : <span className="font-normal">{personalHistory.past_medications || "Empty"}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement of documents */}
        <div className="h-[500px] overflow-y-auto  px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)] scrollbar-hide">
          <div className="flex justify-between items-center ">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Agreement of documents</h2>
          </div>
          <FileUpload />
        </div>


        {/* Medical History */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center ">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Medical History</h2>
            <Editbtn onClick={() => setShowMedicalHistoryModal(true)} />
          </div>

          <div className="py-4">
            <div className="space-y-6 font-nunito text-[16px]">
              <div>
                <p className="text-[#495057]">Congenital condition :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  {medicalHistory.congenital_conditions?.map((condition, index) => (
                    <li key={index}>
                      <strong>{condition.condition}</strong>
                      {condition.severity && `, Severity: ${condition.severity}`}
                      {condition.implication && `, Implications: ${condition.implication}`}
                      {condition.treatment && `, Treatment: ${condition.treatment}`}
                    </li>
                  )) || <li>None</li>}
                </ul>
              </div>

              <div>
                <p className="text-[#495057]">General diseases :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  {medicalHistory.general_diseases?.map((condition, index) => (
                    <li key={index}>
                      <strong>{condition.condition}</strong>
                      {condition.severity && `, Severity: ${condition.severity}`}
                      {condition.implication && `, Implications: ${condition.implication}`}
                      {condition.treatment && `, Treatment: ${condition.treatment}`}
                    </li>
                  )) || <li>None</li>}
                </ul>
              </div>

              <div>
                <p className="text-[#495057]">Surgical interventions :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  {medicalHistory.surgical_interventions?.map((condition, index) => (
                    <li key={index}>
                      <strong>{condition.condition}</strong>
                      {condition.severity && `, Severity: ${condition.severity}`}
                      {condition.implication && `, Implications: ${condition.implication}`}
                      {condition.treatment && `, Treatment: ${condition.treatment}`}
                    </li>
                  )) || <li>None</li>}
                </ul>
              </div>

              <div>
                <p className="text-[#495057]">Allergic reactions :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  {medicalHistory.allergic_reactions?.map((condition, index) => (
                    <li key={index}>
                      <strong>{condition.condition}</strong>
                      {condition.severity && `, Severity: ${condition.severity}`}
                      {condition.implication && `, Implications: ${condition.implication}`}
                      {condition.treatment && `, Treatment: ${condition.treatment}`}
                    </li>
                  )) || <li>None</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Appoitements</h2>
          </div>

          <div className="p-4">
            <div className="flex justify-between mb-4">
              <div className="relative w-full max-w-xs">
                <input type="text" placeholder="Search" className="w-full pl-9 pr-3 py-2 border rounded-md" />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button className="bg-[#008080] text-white rounded-md p-1.5">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative pl-6 border-l-2 border-[#008080]">
              {[1, 2, 3].map((item, index) => (
                <div key={index} className="mb-6 relative">
                  <div className="absolute -left-[22px] top-0 w-4 h-4 rounded-full bg-[#008080]"></div>
                  <p className="text-sm text-[#495057] mb-2">05 Sep 2025 - 09:06</p>
                  <div className="border rounded-md p-3 mb-2">
                    <p className="text-sm">
                      Reason of visit : <span className="font-medium">General check</span>
                    </p>
                  </div>

                  <button className="bg-[#008080] text-white text-sm rounded-md px-3 py-2 w-full">
                    Summary of consultation
                  </button>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health & Clinical Data */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Health & Clinical Data</h2>
            <Editbtn onClick={() => setShowClinicalForm(true)} />
          </div>

          <div className="py-3">
            <div className="space-y-5 font-nunito text-[16px]">
              <p className="font-semibold">Height : <span className="font-normal">{clinicalData.height || "Empty"} cm</span></p>
              <p className="font-semibold">Weight : <span className="font-normal">{clinicalData.weight || "Empty"} kg</span></p>

              {/* Dynamically render health issues based on screenings data */}
              {categories.map(categoryInfo => {
                const categoryKey = categoryInfo.value; // e.g., 'respiratory_diseases'
                const categoryLabel = categoryInfo.label; // e.g., 'Respiratory Diseases'
                const selectedType = clinicalData[categoryKey];
                const notes = clinicalData[`${categoryKey}_notes`];

                // Only display if there is a selected type or notes
                if (selectedType || notes) {
                  return (
                    <div key={categoryKey}>
                      <p className="font-semibold">{categoryLabel} :</p>
                      <div className="ml-4 space-y-1">
                        {selectedType && (
                           <p className="font-normal">Type: {selectedType}</p>
                        )}
                         {notes && (
                          <p className="font-normal">Notes: {notes}</p>
                         )}
                      </div>
                    </div>
                  );
                } else {
                  return null; // Don't render if no data for this category
                }
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    {showBasicInfosForm && (
      <BasicInfosForm 
        onClose={() => setShowBasicInfosForm(false)} 
        onSave={handleBasicInfoSave}
      />
    )}
      {showClinicalForm && (
        <ClinicalForm 
          onClose={() => {
            setShowClinicalForm(false);
            // Re-fetch clinical and medical history data after closing the form
            fetchClinicalAndScreeningData();
            fetchMedicalHistory();
          }}
          onSave={handleClinicalDataSave} 
        />
      )}
      {showPersonalHistoryForm && <PersonalHistoryForm onClose={() => setShowPersonalHistoryForm(false)} onSave={handlePersonalHistorySave} />}
      {showMedicalHistoryModal && (
        <MedicalHistoryModal 
          onClose={() => setShowMedicalHistoryModal(false)} 
          onSave={handleMedicalHistorySave}
          onSaveSuccess={fetchMedicalHistory}
        />
      )}
        </>
  )
}

