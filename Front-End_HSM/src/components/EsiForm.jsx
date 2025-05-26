import { useState, useRef, useEffect } from "react"
import { Pencil, Printer, Trash2 } from "lucide-react"
import Group56Logo from '../assets/Group56.png';
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import axios from "axios"

export default function EsiForm({ selectedPatient }) {
  const [formTreatment, setFormTreatment] = useState({ name: "", dose: "", period: "" })
  const [treatment, setTreatment] = useState([])
  const [formData, setFormData] = useState({
    date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    age: "",
    name: ""
  })
  const prescriptionRef = useRef(null)

  // State for medicine suggestions
  const [medicineSuggestions, setMedicineSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availableMedicines, setAvailableMedicines] = useState([])
  const [loadingMedicines, setLoadingMedicines] = useState(true)
  const [errorLoadingMedicines, setErrorLoadingMedicines] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTreatmentInputChange = (e) => {
    const { name, value } = e.target;
    setFormTreatment(prev => ({
      ...prev,
      [name]: value
    }));

    // Filter medicine suggestions
    if (name === 'name' && value.length > 0) {
      const filteredSuggestions = availableMedicines.filter(medicine =>
        medicine.toLowerCase().startsWith(value.toLowerCase())
      );
      setMedicineSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setMedicineSuggestions([]);
      setShowSuggestions(false);
    }
  };

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

      // Set font for French text
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      // Removed French header lines
      // pdf.text("République Algérienne Démocratique et Populaire", 105, 20, { align: "center" })
      // pdf.text("Ministère de l'Enseignement Supérieur et de la Recherche Scientifique", 105, 25, { align: "center" })
      
      // Add logo ONLY (full width at the top)
      const logo = new Image()
      logo.src = Group56Logo
      await new Promise((resolve) => {
        logo.onload = resolve
      })
      // A4 width is 210mm, so use x=0, width=210mm, height=auto (e.g., 35mm)
      pdf.addImage(logo, "PNG", 0, 10, 210, 35)

      // Add prescription title above the double lines, below the logo
      pdf.setFontSize(20)
      pdf.setFont(undefined, 'bold')
      pdf.setTextColor(0, 128, 128) // #008080
      pdf.text("Medical Prescription", 105, 55, { align: "center" })
      pdf.setFont(undefined, 'normal')
      pdf.setFontSize(16)
      // Add bottom teal line with double lines
      pdf.setDrawColor(0, 128, 128) // #008080
      pdf.setLineWidth(0.5)
      pdf.line(20, 75, 190, 75)
      pdf.line(20, 76, 190, 76)

      // Format the date if it exists
      const formattedDate = formData.date ? new Date(formData.date).toLocaleDateString() : ""

      // Patient info box design improvements (no color change)
      const patientBoxY = 100;
      const patientBoxHeight = 40;
      pdf.setDrawColor(200, 200, 200); // Light gray border
      pdf.setFillColor(245, 245, 245); // Light gray background
      pdf.roundedRect(20, patientBoxY, 170, patientBoxHeight, 6, 6, 'FD'); // Larger border radius

      // Title
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 128, 128);
      pdf.text("Patient Information", 105, patientBoxY + 9, { align: "center" });

      // Details (two columns, more vertical spacing)
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Date: ${formattedDate}`, 30, patientBoxY + 22);
      pdf.text(`Age: ${formData.age}`, 30, patientBoxY + 32);
      pdf.text(`Full Name: ${formData.name}`, 120, patientBoxY + 27);

      // Add treatments section
      pdf.setFontSize(14)
      pdf.setTextColor(0, 128, 128) // #008080
      pdf.text("Treatment needed:", 20, 150)
      pdf.setDrawColor(0, 128, 128)
      pdf.line(20, 152, 190, 152)
      
      let yPosition = 160
      treatment.forEach((t, index) => {
        // Add treatment box
        pdf.setDrawColor(200, 200, 200)
        pdf.setFillColor(245, 245, 245)
        pdf.roundedRect(20, yPosition - 5, 170, 25, 3, 3, 'FD')
        
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        pdf.text(`${index + 1}. ${t.name}`, 30, yPosition)
        pdf.text(`Dose: ${t.dose}`, 30, yPosition + 8)
        pdf.text(`Period: ${t.period}`, 30, yPosition + 16)
        yPosition += 30
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

  // Update internal form data when selectedPatient prop changes
  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        name: selectedPatient.name || "",
        age: selectedPatient.age || ""
      }))
    } else {
       setFormData(prev => ({
        ...prev,
        name: "",
        age: ""
      }))
    }
  }, [selectedPatient])

  // Fetch the list of medicines from the backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoadingMedicines(true);
        setErrorLoadingMedicines(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setErrorLoadingMedicines("Authentication token not found. Please log in again.");
          return;
        }

        const response = await axios.get('/api/medications', { // Updated to include /api prefix
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.data) {
          throw new Error('No data received from the server');
        }

        // Handle different response formats
        let medicines = [];
        if (Array.isArray(response.data)) {
          medicines = response.data.map(med => med.name);
        } else if (response.data.medicines && Array.isArray(response.data.medicines)) {
          medicines = response.data.medicines.map(med => med.name);
        } else {
          throw new Error('Unexpected response format from server');
        }

        if (medicines.length === 0) {
          setErrorLoadingMedicines("No medicines found in the database");
        } else {
          setAvailableMedicines(medicines);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
        let errorMessage = "Failed to load medicines. ";
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage += `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage += "No response from server. Please check your internet connection.";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage += error.message || 'Unknown error occurred';
        }
        
        setErrorLoadingMedicines(errorMessage);
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, []);

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
        className="mx-auto p-8 bg-white rounded-xl"
        style={{ width: '210mm', boxShadow: 'none', border: 'none' }}
      >
        {/* Header */}
        <div className="flex items-center pb-0">
          <div className="flex justify-center w-full relative text-sm text-center text-teal-900 font-medium">
            {/* Center Logo ONLY */}
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
            <span className="text-gray-700 font-medium">{formData.age}</span>
          </div>
          <div className="col-span-2 flex relative items-center gap-2">
            <label className="min-w-[90px] font-medium">Full name :</label>
            <span className="text-gray-700 font-medium">{formData.name}</span>
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
                name="name"
                value={formTreatment.name}
                onChange={handleTreatmentInputChange}
                className="form-input w-full pr-8"
                required
              />
              {loadingMedicines && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400">
                  Loading...
                </div>
              )}
              {errorLoadingMedicines && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500">
                  Error loading medicines
                </div>
              )}
              {showSuggestions && medicineSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                  {medicineSuggestions.map((medicine, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                      onClick={() => {
                        setFormTreatment({ ...formTreatment, name: medicine });
                        setShowSuggestions(false);
                      }}
                    >
                      {medicine}
                    </li>
                  ))}
                </ul>
              )}
              <Pencil className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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