import { useState, useRef } from "react"
import { Pencil, Printer, Trash2 } from "lucide-react"
import OrdonnanceLogo from '../assets/OrdonnanceLogo.png';
import Group56Logo from '../assets/Group56.png';
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function EsiForm() {
  const [formTreatment, setFormTreatment] = useState({ name: "", dose: "", period: "" })
  const [treatment, setTreatment] = useState([])
  const [formData, setFormData] = useState({
    date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    age: "",
    name: ""
  })
  const prescriptionRef = useRef(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generatePDF = async () => {
    try {
      if (!prescriptionRef.current) {
        alert("No prescription content found to save.")
        return
      }

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })

      // Add logo at the top
      const logo = new Image()
      logo.src = OrdonnanceLogo
      await new Promise((resolve) => {
        logo.onload = resolve
      })
      pdf.addImage(logo, "PNG", 0, 10, 210, 35)

      // Patient info (plain text, no box)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      pdf.setTextColor(0, 0, 0)
      const formattedDate = formData.date ? new Date(formData.date).toLocaleDateString() : ""
      pdf.text(`Date: ${formattedDate}`, 20, 55)
      pdf.text(`Age: ${formData.age}`, 110, 55)
      pdf.text(`Full Name: ${formData.name}`, 20, 62)

      // Title: Medical Prescription (centered)
      pdf.setFontSize(20)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.text("Medical Prescription", 105, 75, { align: "center" })

      // Add headers
      pdf.setFont(undefined, 'bold')
      pdf.setFontSize(12)
      pdf.text("Medicine", 20, 88)
      pdf.text("Dose", 100, 88)
      pdf.text("Period", 150, 88)
      pdf.setDrawColor(0, 0, 0)
      pdf.line(20, 90, 190, 90) // Line below headers

      // Treatments (medicines) list
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      let yPosition = 98 // Start below header line
      treatment.forEach((t, index) => {
        // Use columns for better alignment
        pdf.text(`${index + 1}. ${t.name}`, 20, yPosition) // Medicine name
        pdf.text(t.dose, 100, yPosition) // Dose
        pdf.text(t.period, 150, yPosition) // Period

        yPosition += 10
      })

      // Save the PDF
      pdf.save("medical-prescription.pdf")
      alert("Prescription saved successfully!")
    } catch (error) {
      console.error("PDF generation error:", error, error?.message, error?.stack)
      alert("Error generating PDF. Please try again.\n" + (error?.message || ''))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <section className="form-section mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="form-section-title text-xl font-bold">Medical prescription :</h2>
        <div className="flex gap-2">
          <button 
            className="bg-primary hover:bg-primary-dark text-white bg-[#008080] px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={generatePDF}
          >
            Save the report
          </button>
          <button 
            className="border border-primary bg-white text-[#008080] cursor-pointer p-2 rounded-md transition-colors"
            onClick={handlePrint}
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      <div
        ref={prescriptionRef}
        className="mx-auto bg-white rounded-xl w-full max-w-3xl p-4 sm:p-8"
        style={{ boxShadow: 'none', border: 'none' }}
      >
        {/* Header */}
        <div className="flex items-center pb-0">
          <div className="flex justify-center w-full relative text-sm text-center text-teal-900 font-medium">
            {/* Center Logo ONLY - Use Group56Logo for the screen */}
            <img
              src={Group56Logo}
              alt="Logo"
              className="w-full h-auto object-cover relative z-10 mx-auto block"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <label className="min-w-[60px] font-medium">Date :</label>
            <span className="text-gray-700 font-medium">{formData.date}</span>
          </div>
         
          <div className="flex items-center gap-2">
            <label className="min-w-[60px] font-medium">Age :</label>
            <input 
              type="number" 
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Age" 
              className="form-input" 
            />
          </div>
          <div className="col-span-2 flex relative items-center gap-2">
            <label className="min-w-[90px] font-medium">Full name :</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full name" 
              className="form-input w-full" 
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 hover:text-primary hover:text-blue-500">
              <Pencil size={16} />
            </button>
          </div>
        </div>

        {/* Show the date in the prescription display */}
        <div className="mt-4 text-right text-gray-700 text-sm font-medium">
          Date: {formData.date}
        </div>

        {/* Treatment Section */}
        <div className="border-t mt-6 pt-4">
          <h2 className="text-xl font-semibold text-center text-teal-800 mb-4">Treatment needed :</h2>
          
          <form 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4" 
            onSubmit={(e) => {
              e.preventDefault();
              if (formTreatment.name && formTreatment.dose && formTreatment.period) {
                setTreatment([...treatment, formTreatment]); 
                setFormTreatment({ name: "", dose: "", period: "" });
              }
            }}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Medicine name"
                value={formTreatment.name}
                onChange={(e) => setFormTreatment({ ...formTreatment, name: e.target.value })}
                className="form-input w-full pr-8"
                required
              />
              <Pencil className="absolute right-8 top-1/2 -translate-y-1/2 " size={16} />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Doze"
                value={formTreatment.dose}
                onChange={(e) => setFormTreatment({ ...formTreatment, dose: e.target.value })}
                className="form-input w-full pr-8"
                required
              />
              <Pencil className="absolute right-8 top-1/2 -translate-y-1/2 " size={16} />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Periode"
                value={formTreatment.period}
                onChange={(e) => setFormTreatment({ ...formTreatment, period: e.target.value })}
                className="form-input w-full pr-8"
                required
              />
              <Trash2 className="absolute right-8 top-1/2 -translate-y-1/2 text-red-600 cursor-pointer" size={16} />
            </div>
            
            <button type="submit" style={{ display: 'none' }}></button>
          </form>

          <div className="grid gap-4 mt-6">
            {treatment.map((t, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-semibold text-teal-700 mb-1">{t.name}</h3>
                <p className="text-sm text-gray-700"><strong>Dose:</strong> {t.dose}</p>
                <p className="text-sm text-gray-700"><strong>Period:</strong> {t.period}</p>
                <div className="flex justify-end mt-2">
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => {
                      setTreatment(treatment.filter((_, i) => i !== index))
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}