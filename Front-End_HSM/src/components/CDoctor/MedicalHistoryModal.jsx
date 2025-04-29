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
          // Transform the API data to match our sections structure
          const transformedData = [
            {
              id: "1",
              title: "Congenital Conditions",
              conditions: response.data.congenital_conditions || [{
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
              conditions: response.data.general_diseases || [{
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
              conditions: response.data.surgical_interventions || [{
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
              conditions: response.data.allergic_reactions || [{
                id: "4-1",
                condition: "",
                dateAppeared: "",
                severity: "",
                implications: "",
                treatment: "",
              }],
            },
          ];
          
          setSections(transformedData);
        }
      } catch (err) {
        console.error("Failed to fetch medical history:", err);
        setError("Failed to load medical history data. Please try again.");
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

    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem('token');
      
      // Transform sections data to match API structure
      const postData = {
        congenital_conditions: sections[0].conditions,
        general_diseases: sections[1].conditions,
        surgical_interventions: sections[2].conditions,
        allergic_reactions: sections[3].conditions,
      };
      
      // Make POST request to save medical history
      const response = await axios.post(
        `http://127.0.0.1:8000/api/patients/${patientId}/medical-history`,
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
      console.error('Error saving medical history:', err);
      setError(err.response?.data?.message || "Failed to save medical history. Please try again.");
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
                      <input
                        type="text"
                        placeholder="Condition"
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm"
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
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Edit size={16} />
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
                      <input
                        type="text"
                        placeholder="Severity"
                        className="w-full border border-gray-200 rounded-md p-2 pr-8 text-sm"
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
                      />
                      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
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
