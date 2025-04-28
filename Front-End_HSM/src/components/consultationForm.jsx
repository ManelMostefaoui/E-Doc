
import { useRef, useState } from "react"
import { ChevronDown, Pencil, Printer, Trash2, Upload, FileText } from "lucide-react"
import { EsiLogo, EsiText } from "../assets"
import EsiForm from "./EsiForm"
import UploadDocuments from "./UploadDocuments"
import  jsPDF  from "jspdf"
import html2canvas from "html2canvas"
import Ordonnance from "./ordonnance"

export default function ConsultationForm() {
  const [selectedCategory, setSelectedCategory] = useState("")
  const ordonnanceRef = useRef(null)
  const generatePDF = async () => { console.log(ordonnanceRef.current)
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
  const inputFields = [
    "Full name",
    "Age",
    "Height",
    "Weight",
    "Blood pressure",
    "Temperature",
    "Heart rate",
    "Blood sugar",
    "Observations",
  ]
  const [patient, setPatient] = useState({
    name: "John Doe",
    age: 45,
    gender: "Male",
    id: "P12345",
  })
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, medication: "Paracetamol", dosage: "500mg", frequency: "3 times a day", duration: "5 days" },
    { id: 2, medication: "Amoxicillin", dosage: "250mg", frequency: "2 times a day", duration: "7 days" },
  ])

  return (
    <div className="max-w-4xl  mx-auto">
      <h1 className="text-3xl font-bold text-[#008080]  mb-6">Consultation :</h1>

      {/* Patient Vitals & Information */}
      <section className="form-section">
        <h2 className="form-section-title text-[#004D4D] font-bold  text-3xl">Patient vitals & informations :</h2>
        <div className="grid grid-cols-1 gap-4 mt-5">
        <div  className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="form-label">Date :</label>
              <div className="relative">
                <input type="date" placeholder={'Date'} className="form-input pr-10" />
                
              </div>
            </div>
          {inputFields.map((label, index) => (
            <div key={index} className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="form-label">{label} :</label>
              <div className="relative">
                <input type="text" placeholder={label} className="form-input pr-10" />
                <button className=" absolute right-22 top-1/2 -translate-y-1/2  hover:text-primary">
                  <Pencil size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medical Prescription */}
      <EsiForm />
      

      {/* Medical Report */}
      <section className="form-section mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="form-section-title text-xl font-bold  ">Medical report :</h2>
          <button className="border border-primary text-primary hover:bg-primary text-[#008080]  bg-white p-2 rounded-md transition-colors" >
            <Printer size={18} />
          </button>
        </div>

        <div className=" bg-white rounded-lg p-6 border border-gray-200" >
        <div className="flex justify-between w-full relative text-sm text-center text-teal-900 font-medium">
    
    {/* Left side */}
    <div>
      <p className="text-[7px]">République Algérienne Démocratique et Populaire</p>
      <p className="text-[7px]">Ministère de l'Enseignement Supérieur et de la Recherche Scientifique</p>
      <img src={EsiText} alt="ESI Text" className="h-15 mx-auto" />
    </div>

    {/* Center Logo - needs z-index and position */}
    <img
      src={EsiLogo}
      alt="ESI Logo"
      className="h-24 relative z-10" // 👈 bring this logo to front
    />

    {/* Right side */}
    <div className="text-right">
      <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
      <p>وزارة التعليم العالي والبحث العلمي</p>
      <p className="font-bold">المدرسة العليا للإعلام الآلي</p>
      <p className="text-xs text-right" dir="rtl">8 ماي 1945 - سيدي بلعباس</p>
    </div>

    {/* Bottom teal line with transparent center */}
    <div className="h-1 w-full absolute bottom-1 bg-[#008080] z-0">
    
      <div className="w-80 h-full mx-auto bg-white" />
    
    </div>

  </div>

          <div className=" mt-10 grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">Date :</span>
              <div className="relative flex-1">
              <input type="date" placeholder="" className="form-input w-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Age :</span>
              <div className="relative flex-1">
              <input type="number" min={0} placeholder="Age" className="form-input w-full" />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">Full name :</span>
              <div className="relative flex-1">
                <input type="text" placeholder="Full name" className="form-input pr-10" />
                <button className="edit-button absolute right-22 top-1/2 -translate-y-1/2 ">
                  <Pencil size={16}  />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-center text-primary font-bold mb-4 text-[#008080] ">Report :</h3>

            <div className="relative mb-2">
              <input type="text" placeholder="Report ..." className="form-input pr-10" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Documents */}
    <UploadDocuments />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button className="bg-[#008080] hover:bg-primary-dark text-white px-6 py-2 rounded-md text-sm font-medium w-40 transition-colors">
          Save
        </button>
        <button className="border border-red-500 bg-white text-red-700 hover:bg-red-600 hover:text-white w-40 px-6 py-2 rounded-md text-sm font-medium transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
