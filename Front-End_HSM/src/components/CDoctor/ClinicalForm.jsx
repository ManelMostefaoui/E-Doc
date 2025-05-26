"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, Edit, Pencil, Trash2 } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"

export default function ClinicalForm({ onClose, onSave }) {
  const { id: patientId } = useParams()
  const [categoryError, setCategoryError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [addedCategories, setAddedCategories] = useState([])
  const [notes, setNotes] = useState({})
  const [screenings, setScreenings] = useState([]) // Add state for screenings
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Define options for each health issue field using the new categories
  const healthIssueOptions = {
    respiratory_diseases: [
      { value: "Asthma", label: "Asthma" },
      { value: "Allergy", label: "Allergy" },
      { value: "Tuberculosis", label: "Tuberculosis" },
      { value: "Pneumonia", label: "Pneumonia" },
      { value: "Other", label: "Other" },
    ],
    heart_and_vascular_diseases: [
      { value: "High blood pressure (Hypertension)", label: "High blood pressure (Hypertension)" },
      { value: "Acute rheumatic fever (ARF)", label: "Acute rheumatic fever (ARF)" },
      { value: "Arrhythmia (Heart rhythm disorder)", label: "Arrhythmia (Heart rhythm disorder)" },
    ],
    digestive_system_diseases: [
      { value: "Hepatitis", label: "Hepatitis" },
      { value: "Crohn's disease", label: "Crohn's disease" },
      { value: "Celiac disease", label: "Celiac disease" },
      { value: "Stomach ulcer (Gastric ulcer)", label: "Stomach ulcer (Gastric ulcer)" },
      { value: "Other", label: "Other" },
    ],
    endocrine_diseases: [
      { value: "Diabetes mellitus", label: "Diabetes mellitus" },
      { value: "Obesity", label: "Obesity" },
      { value: "Diabetes insipidus", label: "Diabetes insipidus" },
      { value: "Hypothyroidism", label: "Hypothyroidism" },
      { value: "Other", label: "Other" },
    ],
    reproductive_system_diseases: [
      { value: "Ovarian cyst", label: "Ovarian cyst" },
      { value: "Menstrual disorders", label: "Menstrual disorders" },
      { value: "Other", label: "Other" },
    ],
    blood_disorders: [
      { value: "Thalassemia", label: "Thalassemia" },
      { value: "Sickle cell anemia (Sickle cell disease)", label: "Sickle cell anemia (Sickle cell disease)" },
      { value: "Anemia", label: "Anemia" },
      { value: "Other", label: "Other" },
    ],
    urinary_tract_and_kidney_diseases: [
      { value: "Urinary tract infection (UTI)", label: "Urinary tract infection (UTI)" },
      { value: "Kidney failure (Renal failure)", label: "Kidney failure (Renal failure)" },
      { value: "Other", label: "Other" },
    ],
    skin_diseases: [
      { value: "Psoriasis", label: "Psoriasis" },
      { value: "Skin rash", label: "Skin rash" },
      { value: "Other", label: "Other" },
    ],
    ent_diseases: [
      { value: "Sinusitis", label: "Sinusitis" },
      { value: "Tonsillitis", label: "Tonsillitis" },
      { value: "Other", label: "Other" },
    ],
    eye_diseases: [
      { value: "Uveitis", label: "Uveitis" },
      { value: "Conjunctivitis", label: "Conjunctivitis" },
      { value: "Other", label: "Other" },
    ],
    neurological_and_mental_disorders: [
      { value: "Epilepsy", label: "Epilepsy" },
      { value: "Brain tumors (Cavernoma)", label: "Brain tumors (Cavernoma)" },
      { value: "Multiple sclerosis (MS)", label: "Multiple sclerosis (MS)" },
      { value: "Depression", label: "Depression" },
      { value: "Obsessive-compulsive disorder (OCD)", label: "Obsessive-compulsive disorder (OCD)" },
      { value: "Bipolar disorder", label: "Bipolar disorder" },
      { value: "Other", label: "Other" },
    ],
    rheumatic_diseases: [
      { value: "Rheumatoid arthritis (RA)", label: "Rheumatoid arthritis (RA)" },
      { value: "Scoliosis", label: "Scoliosis" },
      { value: "Systemic lupus erythematosus (Lupus)", label: "Systemic lupus erythematosus (Lupus)" },
      { value: "Sciatica", label: "Sciatica" },
      { value: "Clubfoot (Talipes equinovarus)", label: "Clubfoot (Talipes equinovarus)" },
      { value: "Adult-onset Still's disease", label: "Adult-onset Still's disease" },
    ],
    cancers: [{ value: "Cancer", label: "Cancer" }],
  }

  // Replace categories array with the new list
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
  ]

  const subCategories = {
    respiratory_diseases: ["Asthma", "Allergy", "Tuberculosis", "Pneumonia", "Other"],
    heart_and_vascular_diseases: [
      "High blood pressure (Hypertension)",
      "Acute rheumatic fever (ARF)",
      "Arrhythmia (Heart rhythm disorder)",
    ],
    digestive_system_diseases: [
      "Hepatitis",
      "Crohn's disease",
      "Celiac disease",
      "Stomach ulcer (Gastric ulcer)",
      "Other",
    ],
    endocrine_diseases: ["Diabetes mellitus", "Obesity", "Diabetes insipidus", "Hypothyroidism", "Other"],
    reproductive_system_diseases: ["Ovarian cyst", "Menstrual disorders", "Other"],
    blood_disorders: ["Thalassemia", "Sickle cell anemia (Sickle cell disease)", "Anemia", "Other"],
    urinary_tract_and_kidney_diseases: ["Urinary tract infection (UTI)", "Kidney failure (Renal failure)", "Other"],
    skin_diseases: ["Psoriasis", "Skin rash", "Other"],
    ent_diseases: ["Sinusitis", "Tonsillitis", "Other"],
    eye_diseases: ["Uveitis", "Conjunctivitis", "Other"],
    neurological_and_mental_disorders: [
      "Epilepsy",
      "Brain tumors (Cavernoma)",
      "Multiple sclerosis (MS)",
      "Depression",
      "Obsessive-compulsive disorder (OCD)",
      "Bipolar disorder",
      "Other",
    ],
    rheumatic_diseases: [
      "Rheumatoid arthritis (RA)",
      "Scoliosis",
      "Systemic lupus erythematosus (Lupus)",
      "Sciatica",
      "Clubfoot (Talipes equinovarus)",
      "Adult-onset Still's disease",
    ],
    cancers: ["Cancer"],
  }

  // Ajoutez ces états pour la gestion des catégories
  const [selectedMainCategory, setSelectedMainCategory] = useState("")
  const [selectedSubCategory, setSelectedSubCategory] = useState("")
  const [subCategoryNote, setSubCategoryNote] = useState("")

  const [hasExistingScreenings, setHasExistingScreenings] = useState(false)

  useEffect(() => {
    const fetchClinicalData = async () => {
      if (!patientId) return

      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const response = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (response.data) {
          const data = response.data
          const initialFormData = {
            height: data.height || "",
            weight: data.weight || "",
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
          }
          setFormData(initialFormData)
          // Fetch screenings if they exist
          try {
            const screeningsResponse = await axios.get(`http://127.0.0.1:8000/api/Screening/${patientId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            })
            if (screeningsResponse.data && screeningsResponse.data.screenings) {
              setScreenings(screeningsResponse.data.screenings)
              setHasExistingScreenings(true)
            }
          } catch (screeningErr) {
            console.error("Failed to fetch screenings:", screeningErr)
            setHasExistingScreenings(false)
          }
        }
      } catch (err) {
        console.error("Failed to fetch clinical data:", err)
        setError("Failed to load clinical data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchClinicalData()
  }, [patientId])

  const handleCancel = () => {
    if (onClose) onClose()
  }

  // Function to save basic measurements (height and weight)
  const handleMeasurementsSave = async () => {
    if (!patientId) {
      console.error("Patient ID is missing. Cannot save measurements.")
      return;
    }

    try {
      // No need for separate loading state here, handleMainSave manages it
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://127.0.0.1:8000/api/patients/${patientId}/biometric-data`,
        {
          height: formData.height,
          weight: formData.weight,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Measurements save response:", response.data);
      // Do not set success state here, handled by main save function

    } catch (err) {
      console.error("Failed to save measurements:", err);
      // Throw the error so handleMainSave can catch it
      throw err;
    }
  };

  const handleSave = async () => {
    if (!patientId) {
      setError("Patient ID is missing. Cannot save information.")
      return
    }

    try {
      // Loading state is managed by handleMainSave
      setError("")

      const token = localStorage.getItem("token")

      // Prepare data for API from formData - treating health issues as screenings
      const screeningsData = []

      // Remove height and weight from here
      // Add height and weight as measurements
      // if (formData.height) {
      //   screeningsData.push({
      //     patient_id: parseInt(patientId), // Ensure patient_id is a number
      //     category: "measurements",
      //     type: "height",
      //     result: formData.height.toString() // Ensure result is a string
      //   })
      // }
      // if (formData.weight) {
      //   screeningsData.push({
      //     patient_id: parseInt(patientId), // Ensure patient_id is a number
      //     category: "measurements",
      //     type: "weight",
      //     result: formData.weight.toString() // Ensure result is a string
      //   })
      // }

      // Iterate through defined health issue categories
      categories.forEach(categoryInfo => {
        const category = categoryInfo.value // e.g., 'respiratory_diseases'
        const selectedType = formData[category] // e.g., 'Asthma'
        const notes = formData[`${category}_notes`] // e.g., 'respiratory_diseases_notes'

        // Only include if a type is selected or notes are provided
        if (selectedType || notes) {
          screeningsData.push({
            patient_id: parseInt(patientId), // Ensure patient_id is a number
            category: category, // Use the category value (e.g., 'respiratory_diseases')
            type: selectedType || null, // Use the selected health issue type
            result: notes || null, // Use the notes as the result
          })
        }
      })

      // Validate that we have at least one screening entry to send for health issues
      // Allow saving if only measurements are provided and no health issues are selected
      // if (screeningsData.length === 0) {
      //   setError("Please select at least one health issue or add measurements.")
      //   setLoading(false)
      //   return
      // }

      // Only make the API call if there are health issue screenings to save
      if (screeningsData.length > 0) {
        console.log('Sending health issue screenings data:', screeningsData)

        // Wrap the array in an object with the key 'screenings'
        const requestBody = {
          screenings: screeningsData
        };

        // Make POST request to save screenings (health issues)
        const response = await axios.post(
          `http://127.0.0.1:8000/api/Screening/store/${patientId}`,
          requestBody, // Send the wrapped object
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('Health issue screenings save response:', response.data)
      } else {
        console.log('No health issue screenings data to send.')
      }

      // Success state is managed by handleMainSave
      // setError("") // Clear any previous errors on success

      // Close form after short delay - managed by handleMainSave
      // setTimeout(() => {
      //   if (onClose) onClose()
      // }, 1500)

    } catch (err) {
      console.error('Error saving health issues/screenings:', err)
      // Throw the error so handleMainSave can catch it
      throw err;
    }
  }

  // Combined save handler
  const handleMainSave = async () => {
    if (!patientId) {
      setError("Patient ID is missing. Cannot save information.")
      return;
    }

    try {
      setLoading(true); // Start loading
      setError(""); // Clear previous errors
      setSuccess(false); // Clear previous success message

      // First, save the basic measurements (height and weight)
      await handleMeasurementsSave();

      // Then, save the health issues and their notes as screenings
      await handleSave(); // This now only handles health issues

      setSuccess(true); // Set success if both saves complete without error

      // Close the modal after a short delay on success
      setTimeout(() => {
        if (onClose) onClose();
        // Optionally call parent onSave to refresh data in PatientProfile
        // if (onSave) onSave();
      }, 1500);

    } catch (err) {
      console.error("Error in handleMainSave:", err);
      let errorMessage = "Failed to save data.";
      // You can add more specific error handling here based on the thrown error 'err'
      if (err.response && err.response.data) {
        // Try to get a more specific message from the server response
        errorMessage += ` Server message: ${err.response.data.message || JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMessage += ` Error details: ${err.message}`;
      }

      setError(errorMessage);
      setSuccess(false); // Ensure success is false on error
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  // Add screening handling functions
  const handleAddScreening = () => {
    setScreenings([...screenings, { category: "", type: "", result: "" }])
  }

  const handleRemoveScreening = (index) => {
    setScreenings(screenings.filter((_, i) => i !== index))
  }

  const handleScreeningChange = (index, field, value) => {
    const updatedScreenings = [...screenings]
    updatedScreenings[index] = { ...updatedScreenings[index], [field]: value }
    setScreenings(updatedScreenings)
  }

  // Helper function to render form fields
  const renderField = (label, field, type, options = null) => {
    return (
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="col-span-1">
          <label className="block text-sm mb-1">{label}</label>
        </div>
        <div className="col-span-2 relative">
          {type === "select" ? (
            <>
              <select
                className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm appearance-none bg-white"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                disabled={loading}
              >
                <option value="">Select</option>
                {options &&
                  options.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </>
          ) : (
            <>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={label}
                disabled={loading}
              />
              <Pencil className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md md:max-w-lg relative flex flex-col h-[90vh] max-h-[90vh]">
        {/* Close button */}
        <button onClick={handleCancel} className="absolute right-4 top-4 text-teal-600">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 pb-2">
          <h2 className="text-xl font-medium text-teal-600">Health & Critical Data :</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct
            before saving.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mx-6 mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            Clinical data saved successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-6 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* Basic measurements */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Basic Measurements :</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1">
                  <label className="block text-sm mb-1">Height :</label>
                </div>
                <div className="col-span-2 relative">
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    placeholder="Enter height in cm"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1">
                  <label className="block text-sm mb-1">Weight :</label>
                </div>
                <div className="col-span-2 relative">
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    placeholder="Enter weight in kg"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* New Health Issues section with dropdowns and text areas */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Health Issues :</h3>
            <div className="space-y-4">
              {/* Respiratory Diseases */}
              {renderField(
                "Respiratory Diseases",
                "respiratory_diseases",
                "select",
                healthIssueOptions.respiratory_diseases,
              )}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Respiratory Diseases..."
                  value={formData.respiratory_diseases_notes}
                  onChange={(e) => handleChange("respiratory_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Heart and Vascular Diseases */}
              {renderField(
                "Heart and Vascular Diseases",
                "heart_and_vascular_diseases",
                "select",
                healthIssueOptions.heart_and_vascular_diseases,
              )}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Heart and Vascular Diseases..."
                  value={formData.heart_and_vascular_diseases_notes}
                  onChange={(e) => handleChange("heart_and_vascular_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Digestive System Diseases */}
              {renderField(
                "Digestive System Diseases",
                "digestive_system_diseases",
                "select",
                healthIssueOptions.digestive_system_diseases,
              )}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Digestive System Diseases..."
                  value={formData.digestive_system_diseases_notes}
                  onChange={(e) => handleChange("digestive_system_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Endocrine Diseases */}
              {renderField("Endocrine Diseases", "endocrine_diseases", "select", healthIssueOptions.endocrine_diseases)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Endocrine Diseases..."
                  value={formData.endocrine_diseases_notes}
                  onChange={(e) => handleChange("endocrine_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Reproductive System Diseases */}
              {renderField(
                "Reproductive System Diseases",
                "reproductive_system_diseases",
                "select",
                healthIssueOptions.reproductive_system_diseases,
              )}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Reproductive System Diseases..."
                  value={formData.reproductive_system_diseases_notes}
                  onChange={(e) => handleChange("reproductive_system_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Blood Disorders */}
              {renderField("Blood Disorders", "blood_disorders", "select", healthIssueOptions.blood_disorders)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Blood Disorders..."
                  value={formData.blood_disorders_notes}
                  onChange={(e) => handleChange("blood_disorders_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Urinary Tract and Kidney Diseases */}
              {renderField(
                "Urinary Tract and Kidney Diseases",
                "urinary_tract_and_kidney_diseases",
                "select",
                healthIssueOptions.urinary_tract_and_kidney_diseases,
              )}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Urinary Tract and Kidney Diseases..."
                  value={formData.urinary_tract_and_kidney_diseases_notes}
                  onChange={(e) => handleChange("urinary_tract_and_kidney_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Skin Diseases */}
              {renderField("Skin Diseases", "skin_diseases", "select", healthIssueOptions.skin_diseases)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Skin Diseases..."
                  value={formData.skin_diseases_notes}
                  onChange={(e) => handleChange("skin_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* ENT Diseases */}
              {renderField("ENT Diseases", "ent_diseases", "select", healthIssueOptions.ent_diseases)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for ENT Diseases..."
                  value={formData.ent_diseases_notes}
                  onChange={(e) => handleChange("ent_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Eye Diseases */}
              {renderField("Eye Diseases", "eye_diseases", "select", healthIssueOptions.eye_diseases)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Eye Diseases..."
                  value={formData.eye_diseases_notes}
                  onChange={(e) => handleChange("eye_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Neurological and Mental Disorders */}
              {renderField(
                "Neurological and Mental Disorders",
                "neurological_and_mental_disorders",
                "select",
                healthIssueOptions.neurological_and_mental_disorders,
              )}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Neurological and Mental Disorders..."
                  value={formData.neurological_and_mental_disorders_notes}
                  onChange={(e) => handleChange("neurological_and_mental_disorders_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Rheumatic Diseases */}
              {renderField("Rheumatic Diseases", "rheumatic_diseases", "select", healthIssueOptions.rheumatic_diseases)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Rheumatic Diseases..."
                  value={formData.rheumatic_diseases_notes}
                  onChange={(e) => handleChange("rheumatic_diseases_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Cancers */}
              {renderField("Cancers", "cancers", "select", healthIssueOptions.cancers)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Cancers..."
                  value={formData.cancers_notes}
                  onChange={(e) => handleChange("cancers_notes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleMainSave}
            disabled={loading}
            className={`${loading ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"} text-white px-8 py-2 rounded-md transition duration-150`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="border border-red-500 text-red-500 px-6 py-2 rounded-md hover:bg-red-50 transition duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}