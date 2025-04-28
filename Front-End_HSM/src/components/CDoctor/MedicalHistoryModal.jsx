"use client"

import { useState } from "react"
import { X, Edit, ChevronDown, Trash2 } from "lucide-react"

export default function MedicalHistoryModal({ onClose }) {
  const [isOpen, setIsOpen] = useState(true)
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
          <button className="bg-teal-600 text-white px-8 py-2 rounded-md">Save</button>
          <button onClick={handleClose} className="border border-red-500 text-red-500 px-6 py-2 rounded-md">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
