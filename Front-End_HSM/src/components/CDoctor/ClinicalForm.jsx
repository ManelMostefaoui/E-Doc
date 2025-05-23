import React, { useState, useEffect } from "react";
import { X, ChevronDown, Plus, Edit, Pencil } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"

export default function ClinicalForm({ onClose, onSave }) {
    const { id: patientId } = useParams();
    const [categoryError, setCategoryError] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [addedCategories, setAddedCategories] = useState([])
    const [notes, setNotes] = useState({})
    const [editableNotes, setEditableNotes] = useState({});
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
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const categories = [
      "Hearing issues",
      "Vision issues",
      "Skin conditions",
      "Musculoskeletal Issues",
      "Respiratory Problems",
      "Cardiovascular Problems",
      "Oral Health Problems",
      "Genitourinary Issues",
      "Neurological Symptoms",
    ]

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
            setFormData({
              height: response.data.height || "",
              weight: response.data.weight || "",
              hearingIssues: response.data.hearing_issues || "",
              visionIssues: response.data.vision_issues || "",
              skinConditions: response.data.skin_conditions || "",
              musculoskeletalIssues: response.data.musculoskeletal_issues || "",
              respiratoryProblems: response.data.respiratory_problems || "",
              cardiovascularProblems: response.data.cardiovascular_problems || "",
              digestiveIssues: response.data.digestive_issues || "",
              oralHealthProblems: response.data.oral_health_problems || "",
              genitourinaryIssues: response.data.genitourinary_issues || "",
              neurologicalSymptoms: response.data.neurological_symptoms || "",
            });
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

    const handleAddCategory = () => {
        if (selectedCategory && !addedCategories.includes(selectedCategory)) {
          setAddedCategories([...addedCategories, selectedCategory])
          setNotes({ ...notes, [selectedCategory]: "" })
          setSelectedCategory("")
        } else if (!selectedCategory) {
          setCategoryError("Please select a category before adding.")
        }
      }
      
    const handleNoteChange = (category, value) => {
      setNotes({ ...notes, [category]: value })
    }
  
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
        
        // Prepare data for API
        const postData = {
          height: formData.height,
          weight: formData.weight,
          hearing_issues: formData.hearingIssues,
          vision_issues: formData.visionIssues,
          skin_conditions: formData.skinConditions,
          musculoskeletal_issues: formData.musculoskeletalIssues,
          respiratory_problems: formData.respiratoryProblems,
          cardiovascular_problems: formData.cardiovascularProblems,
          digestive_issues: formData.digestiveIssues,
          oral_health_problems: formData.oralHealthProblems,
          genitourinary_issues: formData.genitourinaryIssues,
          neurological_symptoms: formData.neurologicalSymptoms,
        };
        
        // Make PUT request to save clinical data
        const response = await axios.put(
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
        
        console.log('Save response:', response.data);
        setSuccess(true);
        
        // Call onSave callback with updated data
        if (onSave) {
          onSave(postData);
        }
        
        // Close form after short delay
        setTimeout(() => {
          if (onClose) onClose();
        }, 1500);
        
      } catch (err) {
        console.error('Error saving clinical data:', err);
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-12">
      <div className="bg-[#f7f9f9] rounded-xl shadow-[2px_2px_12px_rgba(0,0,0,0.25)] w-full max-w-2xl p-3  border border-gray-100 overflow-hidden">
       
        {/* Header with close button */}
        <div className="flex justify-between items-center py-3 px-7 mt-4 ">
          <h2 className="font-nunito text-[30px] text-[#008080] font-bold text-center flex-grow">Health & critical data :</h2>
          <button className="text-teal-600 text-4xl font-semibold  hover:text-teal-800">×</button>
        </div>
  
       
        <div className="px-12 text-center text-[#1A1A1A] font-nunito text-[16px] mb-8">
          <p>
          Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct before saving.
          </p>
        </div>
  
       {/*select a cetrgory and + button*/}
       <div className="scrollable-container max-h-[38vh] overflow-y-auto mr-6">
       <div className="px-12 mb-8">
            <div className="flex items-center justify-end gap-4">
            <div className="relative w-[320px] max-w-md font-nunito text-[16px] font-normal text-[#495057]">
    <select
      className={`w-full px-7 py-3 pr-10 border ${
        categoryError ? "border-[#C5283D]" : "border-[#008080]/40"
      } rounded-xl appearance-none focus:outline-none focus:ring-2 ${
        categoryError ? "focus:ring-[#C5283D]" : "focus:ring-[#008080]"
      }`}
      value={selectedCategory}
      onChange={(e) => {
        setSelectedCategory(e.target.value)
        setCategoryError("") // clear error when user selects
      }}
    >
      <option value="">Select a category issues</option>
      {categories
        .filter((cat) => !addedCategories.includes(cat))
        .map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
    </select>
    <ChevronDown className="absolute right-6 top-6 transform -translate-y-1/2 text-gray-400" size={20} />
    {categoryError && (
  <p className="text-[#C5283D] text-semibold mt-2">{categoryError}</p>
)}

  </div>

  <button
    onClick={handleAddCategory}
    className="bg-[#008080] hover:bg-[#004d4d] text-white rounded-full p-2 transition-colors"
  >
    <Plus size={24} />
  </button>
            </div>
            </div>
  
            <div className="space-y-6 mb-8 px-12">
  
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="text-gray-700 font-medium w-32">Height :</label>
                <div className="relative flex-1">
                  <select
                    className="w-full py-3 px-6 border border-[#008080]/40 rounded-lg appearance-none bg-[#f7f9f9] pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:outline-none"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  >
                    <option value="">Height</option>
                    {Array.from({ length: 100 }, (_, i) => i + 100).map((cm) => (
                      <option key={cm} value={cm}>
                        {cm} cm
                      </option>
                    ))}
                  </select>
  
                  <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
  
  
  
  
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <label className="text-gray-700 font-medium w-32">Weight :</label>
                <div className="relative flex-1">
                  <select
                    className="w-full py-3 px-6 border border-[#008080]/40 rounded-lg appearance-none bg-[#f7f9f9] pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:outline-none"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  >
                    <option value="">Weight</option>
                    {Array.from({ length: 150 }, (_, i) => i + 30).map((kg) => (
                      <option key={kg} value={kg}>
                        {kg} kg
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#495057] w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>
  
            {addedCategories.map((category) => (
              <div key={category} className="mb-8 px-12">
                <h3 className="text-[#008080] font-semibold mb-4 text-left">{category} :</h3>
                <div className="relative">
                  <textarea
                    className="w-full p-6 border border-[#008080]/40 rounded-xl min-h-[200px] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                    placeholder="Add some notes..."
                    value={notes[category] || ""}
                    onChange={(e) => handleNoteChange(category, e.target.value)}
                  ></textarea>
                  <button className="absolute top-6 right-6 text-gray-400 hover:text-[#008080]">
                    <Edit size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
  
           {/*actions buttons*/}
           <div className="flex flex-col sm:flex-row justify-center gap-4 mb-11">
          <button
            onClick={handleSave}
            className="text-[#f7f9f9] bg-[#008080] font-semibold flex items-center gap-4 border-2 border-[#008080] rounded-lg px-13 py-2 hover:bg-[#006666] transition duration-150">
            Save
          </button>
          <button
            onClick={handleCancel}
            className="text-[#C5283D] bg-[#F7F9F9] border-2 font-semibold flex items-center gap-4 border-[#C5283D] rounded-lg px-13 py-2 hover:text-[#F7F9F9]  hover:bg-[#C5283D] transition duration-150">
            Cancel
          </button>
        </div>
  
  
          </div>
        </div>
      
    )
  }