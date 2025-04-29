import { ChevronDown, Pencil, X } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

function PersonalHistoryForm({ onClose, onSave }) {
  const { id: patientId } = useParams();
  const [formData, setFormData] = useState({
    smoking: "",
    cigarettesPerDay: "",
    chewingTobacco: "",
    numberOfBoxes: "",
    otherForms: "",
    ageAtFirstUse: "",
    formerSmoker: "",
    quitDate: "",
    consumption: "",
    periodeOfExposure: "",
    currentMedications: "",
    pastMedications: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchPersonalHistory = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/personal-history/${patientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.data) {
          setFormData({
            smoking: response.data.smoking || "",
            cigarettesPerDay: response.data.cigarettes_per_day || "",
            chewingTobacco: response.data.chewing_tobacco || "",
            numberOfBoxes: response.data.number_of_boxes || "",
            otherForms: response.data.other_forms || "",
            ageAtFirstUse: response.data.age_at_first_use || "",
            formerSmoker: response.data.former_smoker || "",
            quitDate: response.data.quit_date || "",
            consumption: response.data.consumption || "",
            periodeOfExposure: response.data.periode_of_exposure || "",
            currentMedications: response.data.current_medications || "",
            pastMedications: response.data.past_medications || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch personal history:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonalHistory();
  }, [patientId]);

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
        smoking: formData.smoking,
        cigarettes_per_day: formData.cigarettesPerDay,
        chewing_tobacco: formData.chewingTobacco,
        number_of_boxes: formData.numberOfBoxes,
        other_forms: formData.otherForms,
        age_at_first_use: formData.ageAtFirstUse,
        former_smoker: formData.formerSmoker,
        quit_date: formData.quitDate,
        consumption: formData.consumption,
        periode_of_exposure: formData.periodeOfExposure,
        current_medications: formData.currentMedications,
        past_medications: formData.pastMedications,
      };
      
      // Make POST request to save personal history
      const response = await axios.post(
        `http://127.0.0.1:8000/api/personal-history/store/${patientId}`,
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
      console.error('Error saving personal history:', err);
      setError(err.response?.data?.message || "Failed to save personal history. Please try again.");
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
              <textarea
                rows="1"
                className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px] resize-none"
                value={formData[field]}
                onChange={(e) => {
                  handleChange(field, e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = e.target.scrollHeight + "px"
                }}
                placeholder={label}
                disabled={loading}
              />
              <Pencil className="absolute right-2 top-4 text-gray-400 w-4 h-4 pointer-events-none" />
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
          <h2 className="text-xl font-medium text-teal-600">Personal History :</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct
            before saving.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mx-6 mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            Personal history saved successfully!
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
          {/* Tobacco Section */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Tobacco :</h3>
            <div className="space-y-4">
              {renderField("Smoking", "smoking", "select", [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ])}

              {renderField("Cigarettes per day", "cigarettesPerDay", "select", [
                { value: "1-5", label: "1-5" },
                { value: "6-10", label: "6-10" },
                { value: "11-20", label: "11-20" },
                { value: "20+", label: "20+" },
              ])}

              {renderField("Chewing tobacco", "chewingTobacco", "select", [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ])}

              {renderField("Number of boxes", "numberOfBoxes", "select", [
                { value: "1-5", label: "1-5" },
                { value: "6-10", label: "6-10" },
                { value: "11-20", label: "11-20" },
                { value: "20+", label: "20+" },
              ])}

              {renderField("Other forms", "otherForms", "input")}

              {renderField("Age at first use", "ageAtFirstUse", "select", [
                { value: "under-18", label: "Under 18" },
                { value: "18-21", label: "18-21" },
                { value: "22-30", label: "22-30" },
                { value: "over-30", label: "Over 30" },
              ])}

              {renderField("Former smoker", "formerSmoker", "select", [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ])}

              {renderField("Quit date", "quitDate", "select", [
                { value: "less-than-1-year", label: "Less than 1 year ago" },
                { value: "1-5-years", label: "1-5 years ago" },
                { value: "more-than-5-years", label: "More than 5 years ago" },
              ])}
            </div>
          </div>

          {/* Alcohol Section */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Alcohol :</h3>
            <div className="space-y-4">
              {renderField("Consumption", "consumption", "select", [
                { value: "none", label: "None" },
                { value: "occasional", label: "Occasional" },
                { value: "moderate", label: "Moderate" },
                { value: "heavy", label: "Heavy" },
              ])}

              {renderField("Period of exposure", "periodeOfExposure", "select", [
                { value: "less-than-1-year", label: "Less than 1 year" },
                { value: "1-5-years", label: "1-5 years" },
                { value: "5-10-years", label: "5-10 years" },
                { value: "more-than-10-years", label: "More than 10 years" },
              ])}
            </div>
          </div>

          {/* Medications Section */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Medications :</h3>
            <div className="space-y-4">
              {renderField("Current medications", "currentMedications", "input")}
              {renderField("Past medications", "pastMedications", "input")}
            </div>
          </div>
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

export default PersonalHistoryForm
