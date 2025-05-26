import { ChevronDown, Pencil, X } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

function PersonalHistoryForm({ onClose, onSave }) {
  const { id: patientId } = useParams();
  const [formData, setFormData] = useState({
    smoker: "",
    cigarette_count: "",
    chewing_tobacco: "",
    chewing_tobacco_count: "",
    first_use_age: "",
    former_smoker: "",
    exposure_period: "",
    alcohol: "",
    medications: "",
    other: "",
  });
  const [personalHistoryId, setPersonalHistoryId] = useState(null);
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
        console.log("Personal history response:", response.data);
        if (response.data) {
          setFormData({
            smoker: response.data.smoker === 1 ? "true" : response.data.smoker === 0 ? "false" : "",
            cigarette_count: response.data.cigarette_count ?? "",
            chewing_tobacco: response.data.chewing_tobacco === 1 ? "true" : response.data.chewing_tobacco === 0 ? "false" : "",
            chewing_tobacco_count: response.data.chewing_tobacco_count ?? "",
            first_use_age: response.data.first_use_age ?? "",
            former_smoker: response.data.former_smoker === 1 ? "true" : response.data.former_smoker === 0 ? "false" : "",
            exposure_period: response.data.exposure_period ?? "",
            alcohol: response.data.alcohol ?? "",
            medications: response.data.medications ?? "",
            other: response.data.other ?? "",
          });
          setPersonalHistoryId(response.data.id);
        } else {
          setPersonalHistoryId(null);
        }
      } catch (err) {
        console.error("Failed to fetch personal history:", err);
        setPersonalHistoryId(null);
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
    });
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
      const postData = {
        patient_id: patientId,
        smoker: formData.smoker === "true" ? true : formData.smoker === "false" ? false : null,
        cigarette_count: formData.cigarette_count === "" ? null : parseInt(formData.cigarette_count, 10),
        chewing_tobacco: formData.chewing_tobacco === "true" ? true : formData.chewing_tobacco === "false" ? false : null,
        chewing_tobacco_count: formData.chewing_tobacco_count === "" ? null : parseInt(formData.chewing_tobacco_count, 10),
        first_use_age: formData.first_use_age === "" ? null : parseInt(formData.first_use_age, 10),
        former_smoker: formData.former_smoker === "true" ? true : formData.former_smoker === "false" ? false : null,
        exposure_period: formData.exposure_period || null,
        alcohol: formData.alcohol || null,
        medications: formData.medications || null,
        other: formData.other || null,
      };

      let response;
      if (personalHistoryId) {
        // Update existing personal history
        response = await axios.put(
          `http://127.0.0.1:8000/api/Personal-history/update/${patientId}`,
          postData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Add new personal history
        response = await axios.post(
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
      }

      console.log('Save response:', response.data);
      setSuccess(true);
      if (onSave) {
        onSave(postData);
      }
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
              {renderField("Smoking", "smoker", "select", [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ])}
              {renderField("Cigarettes count", "cigarette_count", "select", [
                { value: "1", label: "1-5" },
                { value: "2", label: "5-10" },
                { value: "3", label: "10-15" },
                { value: "4", label: "15-20" },
                { value: "5", label: "more than 20" },
              ])}
              {renderField("Chewing tobacco", "chewing_tobacco", "select", [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ])}
              {renderField("Chewing tobacco count", "chewing_tobacco_count", "select", [
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "more than 3", label: "more than 3" },
              ])}
              {renderField("Other forms", "other", "input")}
              {renderField("First use age", "first_use_age", "select", [
                { value: "10", label: "10" },
                { value: "15", label: "15" },
                { value: "18", label: "18" },
                { value: "21", label: "21" },
              ])}
              {renderField("Former smoker", "former_smoker", "select", [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ])}
            </div>
          </div>

          {/* Alcohol Section */}
          <div className="mb-6">
            <h3 className="text-teal-600 font-medium mb-4">Alcohol :</h3>
            <div className="space-y-4">
              {renderField("Alcohol consumption", "alcohol", "select", [
                { value: "none", label: "None" },
                { value: "occasional", label: "Occasional" },
                { value: "moderate", label: "Moderate" },
                { value: "heavy", label: "Heavy" },
              ])}
              {renderField("Exposure period", "exposure_period", "select", [
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
              {renderField("Medications", "medications", "input")}
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
