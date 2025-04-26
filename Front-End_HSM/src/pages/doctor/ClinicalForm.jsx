import React, { useState } from "react";
import { X, ChevronDown, Plus, Edit } from "lucide-react"
export default function ClinicalForm() {
    const [categoryError, setCategoryError] = useState("")
    const [height, setHeight] = useState("")
    const [weight, setWeight] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [addedCategories, setAddedCategories] = useState([])
    const [notes, setNotes] = useState({})
    const [editableNotes, setEditableNotes] = useState({});

  
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
  
    const handleSave = () => {
      console.log("Saving form data:", formData)
      // to send the data to your backend
    }
  
    const handleCancel = () => {
      console.log("Form cancelled")
      // Reset form or close modal
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