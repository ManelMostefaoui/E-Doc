import { ChevronDown, Pencil } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

function BasicInfosForm({ onClose, onSave }) {
  const { id: patientId } = useParams();
  const [formData, setFormData] = useState({
    SSN: "",
    bloodType: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Fetch patient data when component mounts
  useEffect(() => {
    const fetchPatientData = async () => {
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
        
        console.log('Patient data:', response.data);
        
        // Update form with existing data
        setFormData({
          SSN: response.data.social_security_no || "",
          bloodType: response.data.blood_group || "",
        });
        
        setError("");
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError("Failed to load patient data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
    // Clear success message when form is edited
    if (success) setSuccess(false);
  }

  const handleSave = async () => {
    if (!patientId) {
      setError("Patient ID is missing. Cannot update information.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('token');
      
      // Prepare data for API
      const updateData = {
        social_security_no: formData.SSN,
        blood_group: formData.bloodType
      };

      // Make PUT request to update patient data
      const response = await axios.put(
        `http://127.0.0.1:8000/api/patients/update/${patientId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Update response:', response.data);
      setSuccess(true);
      
      // Call onSave callback with updated data
      if (onSave) {
        onSave({
          social_security_no: formData.SSN,
          blood_group: formData.bloodType
        });
      }
      
      // Close form after short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error updating patient information:', err);
      setError(err.response?.data?.message || "Failed to update patient information. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    console.log("Form cancelled");
    if (onClose) onClose();
  }

  // Helper function to render form fields
  const renderField = (label, field, type, options = null) => {
    return (
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <label className="mb-2 sm:mb-0 text-[#1A1A1A]">{label}</label>
        <div className="relative w-full sm:w-95">
          {type === "select" ? (
            <>
              <select
                className="w-full py-3 px-6 border border-[#008080]/40 rounded-lg appearance-none bg-[#f7f9f9] pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:outline-none"
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

              <ChevronDown className="absolute right-6 top-1/2 transform -translate-y-1/2 text-[#495057] w-4 h-4 pointer-events-none" />
            </>

          ) : (
            <>
              <textarea
                rows="1"
                className="w-full py-3 px-6 border border-[#008080]/40 rounded-lg pr-10 resize-none overflow-hidden focus:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:outline-none pr-13"
                value={formData[field]}
                onChange={(e) => {
                  handleChange(field, e.target.value)
                  e.target.style.height = "auto"
                  e.target.style.height = e.target.scrollHeight + "px"
                }}
                placeholder={label}
                disabled={loading}
              />

              <Pencil className="absolute right-6 top-1/2 h-3 transform -translate-y-1/2 pointer-events-none text-[#495057]" />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-[#f7f9f9] rounded-xl shadow-[2px_2px_12px_rgba(0,0,0,0.25)] w-full max-w-2xl p-3 border border-gray-100 overflow-hidden">
     
        {/* Header with close button */}
        <div className="flex justify-between items-center py-3 px-7 mt-4 ">
          <h2 className="font-nunito text-[30px] text-[#008080] font-bold text-center flex-grow">Basic information:</h2>
          <button 
            onClick={handleCancel}
            className="text-teal-600 text-4xl font-semibold hover:text-teal-800"
          >×</button>
        </div>

        {/* Description text */}
        <div className="px-12 text-center text-[#1A1A1A] font-nunito text-[16px] mb-5">
          <p>
            Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct
            before saving.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mx-12 mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Information updated successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-12 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        )}

        {/* Form content with scrollable area */}
        <div className="scrollable-container max-h-[25vh] overflow-y-auto px-12 py-2 mr-6 font-nunito text-[16px]">
          <div className="mb-4 mt-2">
            <div className="space-y-4 ">
              {renderField("SSN:", "SSN", "input")}

              {renderField("Blood type:", "bloodType", "select", [
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
              ])}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-11">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`text-[#f7f9f9] ${loading ? 'bg-gray-400' : 'bg-[#008080] hover:bg-[#006666]'} font-semibold flex items-center gap-4 border-2 ${loading ? 'border-gray-400' : 'border-[#008080]'} rounded-lg px-13 py-2 transition duration-150`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-[#C5283D] bg-[#F7F9F9] border-2 font-semibold flex items-center gap-4 border-[#C5283D] rounded-lg px-13 py-2 hover:text-[#F7F9F9] hover:bg-[#C5283D] transition duration-150"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default BasicInfosForm
