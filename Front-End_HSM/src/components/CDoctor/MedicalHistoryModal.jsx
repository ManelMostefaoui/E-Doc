"use client"

import { useState, useEffect } from "react"
import { X, Edit, ChevronDown, Trash2 } from "lucide-react"
import axios from "axios"
import { useParams } from "react-router-dom"

export default function MedicalHistoryModal({ onClose, onSave }) {
  const { id: patientId } = useParams();
  const [isOpen, setIsOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [medicalHistoryId, setMedicalHistoryId] = useState(null)
  const [sections, setSections] = useState([
    {
      id: "1",
      title: "Congenital Conditions",
      conditions: [
        {
          id: "1-1",
          condition: "",
          dateAppeared: "",
          severity: "",
          implications: "",
          treatment: "",
        },
      ],
    },
    {
      id: "2",
      title: "General Diseases",
      conditions: [
        {
          id: "2-1",
          condition: "",
          dateAppeared: "",
          severity: "",
          implications: "",
          treatment: "",
        },
      ],
    },
    {
      id: "3",
      title: "Surgical Interventions",
      conditions: [
        {
          id: "3-1",
          condition: "",
          dateAppeared: "",
          severity: "",
          implications: "",
          treatment: "",
        },
      ],
    },
    {
      id: "4",
      title: "Allergic Reactions",
      conditions: [
        {
          id: "4-1",
          condition: "",
          dateAppeared: "",
          severity: "",
          implications: "",
          treatment: "",
        },
      ],
    },
  ])

  useEffect(() => {
    const fetchMedicalHistory = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/patients/${patientId}/medical-history`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.data) {
          console.log("Medical history response:", response.data);
          
          // Check if we have existing medical history data (could be an array or single object)
          const medicalHistoryData = Array.isArray(response.data) ? response.data : [response.data];
          
          if (medicalHistoryData.length > 0 && medicalHistoryData[0].id) {
            setMedicalHistoryId(medicalHistoryData[0].id);
          }
          
          // Initialize the sections with empty conditions
          const initialSections = [
            {
              id: "1",
              title: "Congenital Conditions",
              conditions: [{
                id: "1-1",
                condition: "",
                dateAppeared: "",
                severity: "",
                implications: "",
                treatment: "",
              }],
            },
            {
              id: "2",
              title: "General Diseases",
              conditions: [{
                id: "2-1",
                condition: "",
                dateAppeared: "",
                severity: "",
                implications: "",
                treatment: "",
              }],
            },
            {
              id: "3",
              title: "Surgical Interventions",
              conditions: [{
                id: "3-1",
                condition: "",
                dateAppeared: "",
                severity: "",
                implications: "",
                treatment: "",
              }],
            },
            {
              id: "4",
              title: "Allergic Reactions",
              conditions: [{
                id: "4-1",
                condition: "",
                dateAppeared: "",
                severity: "",
                implications: "",
                treatment: "",
              }],
            },
          ];
          
          // Process each medical history record and add to appropriate section
          medicalHistoryData.forEach(record => {
            const sectionMap = {
              'congenital': 0,      // Congenital Conditions
              'general_disease': 1, // General Diseases  
              'surgery': 2,         // Surgical Interventions
              'allergy': 3          // Allergic Reactions
            };
            
            const sectionIndex = sectionMap[record.condition];
            
            if (sectionIndex !== undefined) {
              // If this is the first condition in the section, replace the empty placeholder
              if (initialSections[sectionIndex].conditions.length === 1 && 
                  !initialSections[sectionIndex].conditions[0].condition) {
                initialSections[sectionIndex].conditions[0] = {
                  id: `${sectionIndex+1}-1`,
                  condition: record.condition,
                  dateAppeared: record.date_appeared || "",
                  severity: record.severity || "",
                  implications: record.implication || "",
                  treatment: record.treatment || "",
                };
              } else {
                // Otherwise add as a new condition
                initialSections[sectionIndex].conditions.push({
                  id: `${sectionIndex+1}-${initialSections[sectionIndex].conditions.length + 1}`,
                  condition: record.condition,
                  dateAppeared: record.date_appeared || "",
                  severity: record.severity || "",
                  implications: record.implication || "",
                  treatment: record.treatment || "",
                });
              }
            }
          });
          
          setSections(initialSections);
        } else {
          setMedicalHistoryId(null);
        }
      } catch (err) {
        console.error("Failed to fetch medical history:", err);
        setMedicalHistoryId(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMedicalHistory();
  }, [patientId]);

  const addCondition = (sectionId) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            conditions: [
              ...section.conditions,
              {
                id: `${sectionId}-${section.conditions.length + 1}`,
                condition: "",
                dateAppeared: "",
                severity: "",
                implications: "",
                treatment: "",
              },
            ],
          }
        }
        return section
      }),
    )
  }

  const removeCondition = (sectionId, conditionId) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            conditions: section.conditions.filter((condition) => condition.id !== conditionId),
          }
        }
        return section
      }),
    )
  }

  const handleSave = async () => {
    if (!patientId) {
      setError("Patient ID is missing. Cannot save information.");
      return;
    }
  
    // Clear previous errors
    setError("");
  
    // Collect all valid conditions from all sections
    const allConditions = [];
    
    // Process each section and map to backend categories
    sections.forEach((section, index) => {
      const categoryMap = {
        0: 'congenital',      // Congenital Conditions
        1: 'general_disease', // General Diseases  
        2: 'surgery',         // Surgical Interventions
        3: 'allergy'          // Allergic Reactions
      };
      
      section.conditions.forEach(condition => {
        // Only include conditions that have actual content
        if (condition.condition && condition.condition.trim() !== "") {
          allConditions.push({
            condition: categoryMap[index], // This is the required enum value
            date_appeared: condition.dateAppeared || null,
            severity: condition.severity || null,
            implication: condition.implications || null,
            treatment: condition.treatment || null,
          });
        }
      });
    });
  
    // Validate that we have at least one valid condition
    if (allConditions.length === 0) {
      setError("At least one condition field is required.");
      return;
    }
  
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      console.log('Sending data:', allConditions); // Debug log
      
      let response;
      if (medicalHistoryId) {
        // Update existing medical history using the medical history record ID
        response = await axios.put(
          `http://127.0.0.1:8000/api/medical-history/${medicalHistoryId}`,
          allConditions, // Send array directly, not wrapped in object
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new medical history
        response = await axios.post(
          `http://127.0.0.1:8000/api/patients/${patientId}/medical-history`,
          allConditions, // Send array directly, not wrapped in object
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
      
      // Call onSave callback with updated data
      if (onSave) {
        onSave(allConditions);
      }
      
      // Close form after short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Error saving medical history:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.errors) {
        // Handle Laravel validation errors
        const validationErrors = Object.values(err.response.data.errors).flat();
        setError(validationErrors.join(', '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save medical history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md md:max-w-lg relative flex flex-col h-[90vh] max-h-[90vh]">
        {/* Close button */}
        <button onClick={handleClose} className="absolute right-4 top-4 text-teal-600">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-6 pb-2">
          <h2 className="text-xl font-medium text-teal-600">Medical History :</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct
            before saving.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mx-6 mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            Medical history saved successfully!
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
          {sections.map((section) => (
            <div key={section.id} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-teal-600 font-medium">{section.title} :</h3>
                <button
                  className="bg-teal-600 text-white px-4 py-1 rounded-md text-sm"
                  onClick={() => addCondition(section.id)}
                >
                  Add
                </button>
              </div>

              {section.conditions.map((condition) => (
                <div key={condition.id} className="mb-4 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-1">
                      <label className="block text-sm mb-1">Condition :</label>
                    </div>
                    <div className="col-span-2 relative">
                      <select
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm appearance-none"
                        value={condition.condition}
                        onChange={(e) => {
                          setSections(prevSections =>
                            prevSections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    conditions: s.conditions.map(c =>
                                      c.id === condition.id
                                        ? { ...c, condition: e.target.value }
                                        : c
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                      >
                        <option value="">Select Type</option>
                        <option value="congenital">Congenital</option>
                        <option value="general_disease">General Disease</option>
                        <option value="surgery">Surgery</option>
                        <option value="allergy">Allergy</option>
                      </select>
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-1">
                      <label className="block text-sm mb-1">Date appeared :</label>
                    </div>
                    <div className="col-span-2 relative">
                      <input
                        type="text"
                        placeholder="Date"
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm"
                        value={condition.dateAppeared}
                        onChange={(e) => {
                          setSections(prevSections =>
                            prevSections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    conditions: s.conditions.map(c =>
                                      c.id === condition.id
                                        ? { ...c, dateAppeared: e.target.value }
                                        : c
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-1">
                      <label className="block text-sm mb-1">Severity :</label>
                    </div>
                    <div className="col-span-2 relative">
                      <select
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm appearance-none"
                        value={condition.severity}
                        onChange={(e) => {
                          setSections(prevSections =>
                            prevSections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    conditions: s.conditions.map(c =>
                                      c.id === condition.id
                                        ? { ...c, severity: e.target.value }
                                        : c
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                      >
                        <option value="">Select Severity</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-1">
                      <label className="block text-sm mb-1">Implications :</label>
                    </div>
                    <div className="col-span-2 relative">
                      <textarea
                        placeholder="Implications"
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px]"
                        value={condition.implications}
                        onChange={(e) => {
                          setSections(prevSections =>
                            prevSections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    conditions: s.conditions.map(c =>
                                      c.id === condition.id
                                        ? { ...c, implications: e.target.value }
                                        : c
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                      />
                      <button className="absolute right-2 top-4 text-gray-400">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="col-span-1">
                      <label className="block text-sm mb-1">Treatment :</label>
                    </div>
                    <div className="col-span-2 relative">
                      <textarea
                        placeholder="Treatment"
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm min-h-[80px]"
                        value={condition.treatment}
                        onChange={(e) => {
                          setSections(prevSections =>
                            prevSections.map(s =>
                              s.id === section.id
                                ? {
                                    ...s,
                                    conditions: s.conditions.map(c =>
                                      c.id === condition.id
                                        ? { ...c, treatment: e.target.value }
                                        : c
                                    ),
                                  }
                                : s
                            )
                          );
                        }}
                      />
                      <button className="absolute right-2 top-4 text-gray-400">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      className="border border-red-300 rounded-md p-1 text-red-500"
                      onClick={() => removeCondition(section.id, condition.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
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
            onClick={handleClose}
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
