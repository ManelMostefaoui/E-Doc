"use client"

import { useState, useEffect } from "react"
import { X, ChevronDown, Edit, Pencil } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"

export default function ClinicalForm({ onClose, onSave }) {
  const { id: patientId } = useParams();
  const [categoryError, setCategoryError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [addedCategories, setAddedCategories] = useState([])
  const [notes, setNotes] = useState({})
  const [screenings, setScreenings] = useState([]); // Add state for screenings
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    hearingIssues: "",
    visionIssues: "",
    skinConditions: "",
    musculoskeletalIssues: "",
    respiratoryProblems: "",
    cardiovascularProblems: "",
    digestiveIssues: "",
    oralHealthProblems: "",
    genitourinaryIssues: "",
    neurologicalSymptoms: "",
    // Add new fields for notes
    hearingIssuesNotes: "",
    visionIssuesNotes: "",
    skinConditionsNotes: "",
    musculoskeletalIssuesNotes: "",
    respiratoryProblemsNotes: "",
    cardiovascularProblemsNotes: "",
    digestiveIssuesNotes: "",
    oralHealthProblemsNotes: "",
    genitourinaryIssuesNotes: "",
    neurologicalSymptomsNotes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Define options for each health issue field
  const healthIssueOptions = {
    hearingIssues: [
      { value: 'Hearing Loss', label: 'Hearing Loss' },
      { value: 'Tinnitus', label: 'Tinnitus' },
      { value: 'Ear Infection', label: 'Ear Infection' },
      { value: 'Other', label: 'Other' },
    ],
    visionIssues: [
      { value: 'Nearsightedness', label: 'Nearsightedness' },
      { value: 'Farsightedness', label: 'Farsightedness' },
      { value: 'Astigmatism', label: 'Astigmatism' },
      { value: 'Cataracts', label: 'Cataracts' },
      { value: 'Glaucoma', label: 'Glaucoma' },
      { value: 'Other', label: 'Other' },
    ],
    skinConditions: [
      { value: 'Eczema', label: 'Eczema' },
      { value: 'Psoriasis', label: 'Psoriasis' },
      { value: 'Acne', label: 'Acne' },
      { value: 'Dermatitis', label: 'Dermatitis' },
      { value: 'Other', label: 'Other' },
    ],
    musculoskeletalIssues: [
      { value: 'Arthritis', label: 'Arthritis' },
      { value: 'Osteoporosis', label: 'Osteoporosis' },
      { value: 'Back Pain', label: 'Back Pain' },
      { value: 'Joint Pain', label: 'Joint Pain' },
      { value: 'Other', label: 'Other' },
    ],
    respiratoryProblems: [
      { value: 'Asthma', label: 'Asthma' },
      { value: 'Allergy', label: 'Allergy' },
      { value: 'Tuberculosis', label: 'Tuberculosis' },
      { value: 'Pneumonia', label: 'Pneumonia' },
      { value: 'Other', label: 'Other' },
    ],
    cardiovascularProblems: [
      { value: 'Hypertension', label: 'Hypertension' },
      { value: 'Coronary Artery Disease', label: 'Coronary Artery Disease' },
      { value: 'Heart Failure', label: 'Heart Failure' },
      { value: 'Arrhythmia', label: 'Arrhythmia' },
      { value: 'Other', label: 'Other' },
    ],
    digestiveIssues: [
      { value: 'IBS', label: 'IBS' },
      { value: 'GERD', label: 'GERD' },
      { value: 'Ulcers', label: 'Ulcers' },
      { value: 'Constipation', label: 'Constipation' },
      { value: 'Diarrhea', label: 'Diarrhea' },
      { value: 'Other', label: 'Other' },
    ],
    oralHealthProblems: [
      { value: 'Cavities', label: 'Cavities' },
      { value: 'Gum Disease', label: 'Gum Disease' },
      { value: 'Oral Infections', label: 'Oral Infections' },
      { value: 'Other', label: 'Other' },
    ],
    genitourinaryIssues: [
      { value: 'UTI', label: 'UTI' },
      { value: 'Kidney Stones', label: 'Kidney Stones' },
      { value: 'Incontinence', label: 'Incontinence' },
      { value: 'Other', label: 'Other' },
    ],
    neurologicalSymptoms: [
      { value: 'Headaches', label: 'Headaches' },
      { value: 'Migraines', label: 'Migraines' },
      { value: 'Epilepsy', label: 'Epilepsy' },
      { value: 'Neuropathy', label: 'Neuropathy' },
      { value: 'Other', label: 'Other' },
    ],
  };

  // Remove unused categories array
  // const categories = [
  //   "respiratory diseases",
  //   "heart and vascular diseases",
  //   "digestive system diseases",
  //   "endocrine diseases",
  //   "reproductive system diseases",
  //   "blood_disorders",
  //   "urinary tract and kidney diseases",
  //   "skin diseases",
  //   "ent diseases",
  //   "eye diseases",
  //   "neurological and mental disorders",
  //   "rheumatic diseases",
  //   "cancers"
  // ]

  const [hasExistingScreenings, setHasExistingScreenings] = useState(false);

  // Update the fetchClinicalData function to set hasExistingScreenings
  useEffect(() => {
    const fetchClinicalData = async () => {
      if (!patientId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (response.data) {
          const data = response.data;
          const initialFormData = {
            height: data.height || "",
            weight: data.weight || "",
            // Initialize health issue fields and notes by parsing the string
            hearingIssues: "", hearingIssuesNotes: "",
            visionIssues: "", visionIssuesNotes: "",
            skinConditions: "", skinConditionsNotes: "",
            musculoskeletalIssues: "", musculoskeletalIssuesNotes: "",
            respiratoryProblems: "", respiratoryProblemsNotes: "",
            cardiovascularProblems: "", cardiovascularProblemsNotes: "",
            digestiveIssues: "", digestiveIssuesNotes: "",
            oralHealthProblems: "", oralHealthProblemsNotes: "",
            genitourinaryIssues: "", genitourinaryIssuesNotes: "",
            neurologicalSymptoms: "", neurologicalSymptomsNotes: "",
          };

          // Function to parse the combined string
          const parseHealthIssue = (apiField) => {
            if (!apiField) return { issue: "", notes: "" };
            const parts = apiField.split(': ');
            if (parts.length > 1) {
              return { issue: parts[0], notes: parts.slice(1).join(': ') };
            }
            return { issue: apiField, notes: "" };
          };

          // Populate form data by parsing API response
          Object.keys(healthIssueOptions).forEach(field => {
            const apiFieldName = field.replace(/([A-Z])/g, '_$1').toLowerCase(); // Convert camelCase to snake_case
            const parsed = parseHealthIssue(data[apiFieldName]);
            initialFormData[field] = parsed.issue;
            initialFormData[`${field}Notes`] = parsed.notes;
          });


          setFormData(initialFormData);
          // Fetch screenings if they exist
          try {
            const screeningsResponse = await axios.get(`http://127.0.0.1:8000/api/Screening/${patientId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            if (screeningsResponse.data && screeningsResponse.data.screenings) {
              setScreenings(screeningsResponse.data.screenings);
              setHasExistingScreenings(true);
            }
          } catch (screeningErr) {
            console.error("Failed to fetch screenings:", screeningErr);
            setHasExistingScreenings(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch clinical data:", err);
        setError("Failed to load clinical data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClinicalData();
  }, [patientId]);

  // Remove unused handleAddCategory and handleNoteChange functions
  // const handleAddCategory = () => {
  //     if (selectedCategory && !addedCategories.includes(selectedCategory)) {
  //       setAddedCategories([...addedCategories, selectedCategory])
  //       setNotes({ ...notes, [selectedCategory]: "" })
  //       setSelectedCategory("")
  //     } else if (!selectedCategory) {
  //       setCategoryError("Please select a category before adding.")
  //     }
  //   }

  // const handleNoteChange = (category, value) => {
  //   setNotes({ ...notes, [category]: value })
  // }

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSave = async () => {
    if (!patientId) {
      setError("Patient ID is missing. Cannot save information.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem('token');

      // Prepare data for API - combine selected issue and notes
      const postData = {
        height: formData.height,
        weight: formData.weight,
        hearing_issues: formData.hearingIssues ? `${formData.hearingIssues}${formData.hearingIssuesNotes ? ': ' + formData.hearingIssuesNotes : ''}` : "",
        vision_issues: formData.visionIssues ? `${formData.visionIssues}${formData.visionIssuesNotes ? ': ' + formData.visionIssuesNotes : ''}` : "",
        skin_conditions: formData.skinConditions ? `${formData.skinConditions}${formData.skinConditionsNotes ? ': ' + formData.skinConditionsNotes : ''}` : "",
        musculoskeletal_issues: formData.musculoskeletalIssues ? `${formData.musculoskeletalIssues}${formData.musculoskeletalIssuesNotes ? ': ' + formData.musculoskeletalIssuesNotes : ''}` : "",
        respiratory_problems: formData.respiratoryProblems ? `${formData.respiratoryProblems}${formData.respiratoryProblemsNotes ? ': ' + formData.respiratoryProblemsNotes : ''}` : "",
        cardiovascular_problems: formData.cardiovascularProblems ? `${formData.cardiovascularProblems}${formData.cardiovascularProblemsNotes ? ': ' + formData.cardiovascularProblemsNotes : ''}` : "",
        digestive_issues: formData.digestiveIssues ? `${formData.digestiveIssues}${formData.digestiveIssuesNotes ? ': ' + formData.digestiveIssuesNotes : ''}` : "",
        oral_health_problems: formData.oralHealthProblems ? `${formData.oralHealthProblems}${formData.oralHealthProblemsNotes ? ': ' + formData.oralHealthProblemsNotes : ''}` : "",
        genitourinary_issues: formData.genitourinaryIssues ? `${formData.genitourinaryIssues}${formData.genitourinaryIssuesNotes ? ': ' + formData.genitourinaryIssuesNotes : ''}` : "",
        neurological_symptoms: formData.neurologicalSymptoms ? `${formData.neurologicalSymptoms}${formData.neurologicalSymptomsNotes ? ': ' + formData.neurologicalSymptomsNotes : ''}` : "",
      };

      // Save clinical data
      await axios.put(
        `http://127.0.0.1:8000/api/patients/${patientId}/biometric-data`,
        postData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Save screenings with conditional POST/PUT
      if (screenings.length > 0) {
        const screeningData = { screenings };

        if (hasExistingScreenings) {
          // Update existing screenings
          await axios.put(
            `http://127.0.0.1:8000/api/Screening/update/${patientId}`,
            screeningData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          // Create new screenings
          await axios.post(
            `http://127.0.0.1:8000/api/Screening/store/${patientId}`,
            screeningData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }

      console.log("Save response:", response.data);
      setSuccess(true);
      if (onSave) {
        onSave();
      }

      // Close form after short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err) {
      console.error("Failed to save clinical data:", err);
      setError(err.response?.data?.message || "Failed to save clinical data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    if (onClose) onClose();
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
          {/* Remove Category selector */}
          {/* <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-teal-600 font-medium">Add Health Issue :</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select
                      className={`border ${
                        categoryError ? "border-red-500" : "border-gray-200"
                      } rounded-md p-2 pr-8 text-sm appearance-none bg-white`}
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCategoryError("");
                      }}
                    >
                      <option value="">Select a category</option>
                      {categories
                        .filter((cat) => !addedCategories.includes(cat))
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  </div>
                  <button
                    onClick={handleAddCategory}
                    className="bg-teal-600 text-white rounded-full p-1 hover:bg-teal-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {categoryError && (
                <p className="text-red-500 text-xs mt-1">{categoryError}</p>
              )}
            </div> */}

          {/* Basic measurements */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Basic Measurements :</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1">
                  <label className="block text-sm mb-1">Height :</label>
                </div>
                <div className="col-span-2 relative">
                  <select
                    className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm appearance-none bg-white"
                    value={formData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select height</option>
                    {Array.from({ length: 100 }, (_, i) => i + 100).map((cm) => (
                      <option key={cm} value={cm}>
                        {cm} cm
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1">
                  <label className="block text-sm mb-1">Weight :</label>
                </div>
                <div className="col-span-2 relative">
                  <select
                    className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm appearance-none bg-white"
                    value={formData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select weight</option>
                    {Array.from({ length: 150 }, (_, i) => i + 30).map((kg) => (
                      <option key={kg} value={kg}>
                        {kg} kg
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* New Health Issues section with dropdowns and text areas */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Health Issues :</h3>
            <div className="space-y-4">
              {/* Hearing Issues */}
              {renderField("Hearing Issues", "hearingIssues", "select", healthIssueOptions.hearingIssues)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Hearing Issues..."
                  value={formData.hearingIssuesNotes}
                  onChange={(e) => handleChange("hearingIssuesNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Vision Issues */}
              {renderField("Vision Issues", "visionIssues", "select", healthIssueOptions.visionIssues)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Vision Issues..."
                  value={formData.visionIssuesNotes}
                  onChange={(e) => handleChange("visionIssuesNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Skin Conditions */}
              {renderField("Skin Conditions", "skinConditions", "select", healthIssueOptions.skinConditions)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Skin Conditions..."
                  value={formData.skinConditionsNotes}
                  onChange={(e) => handleChange("skinConditionsNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Musculoskeletal Issues */}
              {renderField("Musculoskeletal Issues", "musculoskeletalIssues", "select", healthIssueOptions.musculoskeletalIssues)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Musculoskeletal Issues..."
                  value={formData.musculoskeletalIssuesNotes}
                  onChange={(e) => handleChange("musculoskeletalIssuesNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Respiratory Problems */}
              {renderField("Respiratory Problems", "respiratoryProblems", "select", healthIssueOptions.respiratoryProblems)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Respiratory Problems..."
                  value={formData.respiratoryProblemsNotes}
                  onChange={(e) => handleChange("respiratoryProblemsNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Cardiovascular Problems */}
              {renderField("Cardiovascular Problems", "cardiovascularProblems", "select", healthIssueOptions.cardiovascularProblems)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Cardiovascular Problems..."
                  value={formData.cardiovascularProblemsNotes}
                  onChange={(e) => handleChange("cardiovascularProblemsNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Digestive Issues */}
              {renderField("Digestive Issues", "digestiveIssues", "select", healthIssueOptions.digestiveIssues)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Digestive Issues..."
                  value={formData.digestiveIssuesNotes}
                  onChange={(e) => handleChange("digestiveIssuesNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Oral Health Problems */}
              {renderField("Oral Health Problems", "oralHealthProblems", "select", healthIssueOptions.oralHealthProblems)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Oral Health Problems..."
                  value={formData.oralHealthProblemsNotes}
                  onChange={(e) => handleChange("oralHealthProblemsNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Genitourinary Issues */}
              {renderField("Genitourinary Issues", "genitourinaryIssues", "select", healthIssueOptions.genitourinaryIssues)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Genitourinary Issues..."
                  value={formData.genitourinaryIssuesNotes}
                  onChange={(e) => handleChange("genitourinaryIssuesNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Neurological Symptoms */}
              {renderField("Neurological Symptoms", "neurologicalSymptoms", "select", healthIssueOptions.neurologicalSymptoms)}
              <div className="relative mb-3">
                <textarea
                  className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                  placeholder="Add notes for Neurological Symptoms..."
                  value={formData.neurologicalSymptomsNotes}
                  onChange={(e) => handleChange("neurologicalSymptomsNotes", e.target.value)}
                  disabled={loading}
                />
                <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Remove Added categories section */}
          {/* {addedCategories.map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-teal-600 font-medium mb-4">{category} :</h3>
                <div className="relative">
                  <textarea
                    className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[120px] resize-none"
                    placeholder={`Add notes about ${category.toLowerCase()}...`}
                    value={notes[category] || ""}
                    onChange={(e) => handleNoteChange(category, e.target.value)}
                    disabled={loading}
                  />
                  <Edit className="absolute right-2 top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            ))} */}
        </div>

        {/* Footer with buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`${loading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'} text-white px-8 py-2 rounded-md transition duration-150`}
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

// Add screening handling functions
const handleAddScreening = () => {
  setScreenings([...screenings, { category: "", type: "", result: "" }]);
};

const handleRemoveScreening = (index) => {
  setScreenings(screenings.filter((_, i) => i !== index));
};

const handleScreeningChange = (index, field, value) => {
  const updatedScreenings = [...screenings];
  updatedScreenings[index] = { ...updatedScreenings[index], [field]: value };
  setScreenings(updatedScreenings);
};

const handleSave = async () => {
  if (!patientId) {
    setError("Patient ID is missing. Cannot save information.");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const token = localStorage.getItem('token');

    // Prepare data for API - combine selected issue and notes
    const postData = {
      height: formData.height,
      weight: formData.weight,
      hearing_issues: formData.hearingIssues ? `${formData.hearingIssues}${formData.hearingIssuesNotes ? ': ' + formData.hearingIssuesNotes : ''}` : "",
      vision_issues: formData.visionIssues ? `${formData.visionIssues}${formData.visionIssuesNotes ? ': ' + formData.visionIssuesNotes : ''}` : "",
      skin_conditions: formData.skinConditions ? `${formData.skinConditions}${formData.skinConditionsNotes ? ': ' + formData.skinConditionsNotes : ''}` : "",
      musculoskeletal_issues: formData.musculoskeletalIssues ? `${formData.musculoskeletalIssues}${formData.musculoskeletalIssuesNotes ? ': ' + formData.musculoskeletalIssuesNotes : ''}` : "",
      respiratory_problems: formData.respiratoryProblems ? `${formData.respiratoryProblems}${formData.respiratoryProblemsNotes ? ': ' + formData.respiratoryProblemsNotes : ''}` : "",
      cardiovascular_problems: formData.cardiovascularProblems ? `${formData.cardiovascularProblems}${formData.cardiovascularProblemsNotes ? ': ' + formData.cardiovascularProblemsNotes : ''}` : "",
      digestive_issues: formData.digestiveIssues ? `${formData.digestiveIssues}${formData.digestiveIssuesNotes ? ': ' + formData.digestiveIssuesNotes : ''}` : "",
      oral_health_problems: formData.oralHealthProblems ? `${formData.oralHealthProblems}${formData.oralHealthProblemsNotes ? ': ' + formData.oralHealthProblemsNotes : ''}` : "",
      genitourinary_issues: formData.genitourinaryIssues ? `${formData.genitourinaryIssues}${formData.genitourinaryIssuesNotes ? ': ' + formData.genitourinaryIssuesNotes : ''}` : "",
      neurological_symptoms: formData.neurologicalSymptoms ? `${formData.neurologicalSymptoms}${formData.neurologicalSymptomsNotes ? ': ' + formData.neurologicalSymptomsNotes : ''}` : "",
    };

    // Save clinical data
    await axios.put(
      `http://127.0.0.1:8000/api/patients/${patientId}/biometric-data`,
      postData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    // Save screenings
    const screeningEndpoint = screenings.length > 0
      ? `http://127.0.0.1:8000/api/Screening/update/${patientId}`
      : `http://127.0.0.1:8000/api/Screening/store/${patientId}`;

    const screeningMethod = screenings.length > 0 ? 'put' : 'post';

    await axios[screeningMethod](
      screeningEndpoint,
      { screenings },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    setSuccess(true);
    if (onSave) {
      onSave({ ...postData, screenings });
    }
    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);

  } catch (err) {
    console.error('Error saving data:', err);
    setError(err.response?.data?.message || "Failed to save data. Please try again.");
  } finally {
    setLoading(false);
  }
};
