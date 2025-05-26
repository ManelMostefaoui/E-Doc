"use client"

import { useRef } from "react"
//import { Button } from "@/components/ui/button"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export default function Ordonnance({ doctor, patient, prescriptions, date }) {
  const ordonnanceRef = useRef(null)

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const generatePDF = async () => {
    if (!ordonnanceRef.current) return

    const element = ordonnanceRef.current
    const canvas = await html2canvas(element, { scale: 2 })
    const data = canvas.toDataURL("image/png")

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgProps = pdf.getImageProperties(data)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save("medical-prescription.pdf")
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Medical Prescription</h2>
        <button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700">
          Save as PDF
        </button>
      </div>

      <div ref={ordonnanceRef} className="bg-white p-8 border border-gray-300 rounded-lg">
        {/* Header */}
        <div className="flex justify-between border-b border-gray-300 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-800">{doctor.name}</h1>
            <p className="text-gray-600">{doctor.specialization}</p>
            <p className="text-gray-600">License: {doctor.license}</p>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-gray-800">{doctor.clinic}</h2>
            <p className="text-gray-600">{doctor.address}</p>
            <p className="text-gray-600">{doctor.phone}</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="mb-6">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">
                Patient: <span className="font-bold">{patient.name}</span>
              </p>
              <p className="text-gray-600">ID: {patient.id}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Age: {patient.age} years</p>
              <p className="text-gray-600">Date: {formatDate(date)}</p>
            </div>
          </div>
        </div>

        {/* Rx Symbol */}
        <div className="mb-6">
          <span className="text-3xl font-serif italic font-bold">Rx</span>
        </div>

        {/* Prescriptions */}
        <div className="mb-8">
          <ul className="space-y-4">
            {prescriptions.map((prescription) => (
              <li key={prescription.id} className="border-b border-gray-200 pb-3">
                <div className="flex items-baseline">
                  <span className="text-lg font-medium mr-2">{prescription.medication}</span>
                  <span className="text-gray-700">{prescription.dosage}</span>
                </div>
                <p className="text-gray-600 ml-5">
                  {prescription.frequency} for {prescription.duration}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between">
          <div>
            <p className="text-gray-600 text-sm">Take medication as prescribed</p>
            <p className="text-gray-600 text-sm">Contact doctor for any concerns</p>
          </div>
          <div className="text-right">
            <div className="mb-10"></div>
            <div className="border-t border-gray-400 pt-1">
              <p className="font-medium">Doctor's Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
