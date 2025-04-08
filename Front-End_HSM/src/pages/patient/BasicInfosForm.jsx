import { ChevronDown , Pencil} from "lucide-react"
import { useState } from "react"

function BasicInfosForm() {
  const [formData, setFormData] = useState({
    SSN: "",
    Bloodtype: "",
  })

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSave = () => {
    console.log("Saving form data:", formData)
    // to send the data to your backend
  }

  const handleCancel = () => {
    console.log("Form cancelled")
    // Reset form or close modal
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
                className="w-full py-3 px-6 border border-[#008080]/40 rounded-lg appearance-none bg-[#f7f9f9] pr-10 focus:border-[#008080] focus:ring-2 focus:ring-[#008080] focus:outline-none
"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
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
        <h2 className="font-nunito text-[30px] text-[#008080] font-bold text-center flex-grow">Basic informations :</h2>
        <button className="text-teal-600 text-4xl font-semibold  hover:text-teal-800">×</button>
      </div>

     
      <div className="px-12 text-center text-[#1A1A1A] font-nunito text-[16px] mb-5">
        <p>
          Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct
          before saving.
        </p>
      </div>

      {/* Form content with scrollable area */}
      <div className="scrollable-container max-h-[25vh] overflow-y-auto px-12 py-2 mr-6 font-nunito text-[16px]">
       
        
        <div className="mb-4 mt-2">
        
          <div className="space-y-4 ">
            {renderField("SSN:", "SSN", "input")}

            {renderField("Blood type :", "bloodType", "select", [
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
export default BasicInfosForm
