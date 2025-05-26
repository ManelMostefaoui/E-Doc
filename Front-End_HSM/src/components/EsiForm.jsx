import { useState, useRef, useEffect } from "react"
import { Pencil, Printer, Trash2 } from "lucide-react"
import Group56Logo from '../assets/Group56.png'; // Re-import the original logo
import OrdonnanceLogo from '../assets/OrdonnanceLogo.png'; // Import your new logo file with the correct name
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
      
      // Get page dimensions and calculate initial positioning variables
      const pageCenterX = pdf.internal.pageSize.getWidth() / 2;
      const topY = 10; // Starting vertical position for logo (adjust as needed)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const logoWidth = pageWidth - 20; // Increased width: Example width (page width minus smaller margins)
      const logoX = (pageWidth - logoWidth) / 2; // Center the logo horizontally

      // Add logo at the top, spanning the width
      const logo = new Image()
      // Replace the next line with your new logo source
      logo.src = OrdonnanceLogo; // Use your imported logo source for the PDF
      // Keeping the old logo source for now as a placeholder:
      // logo.src = "/src/assets/Group56.png"; // TEMPORARY: REPLACE WITH YOUR NEW LOGO SOURCE - Removed
      
      // Add the logo image to the PDF immediately (position and width are known)
      pdf.addImage(logo, "PNG", logoX, topY, logoWidth, 0); // Use 0 for height to auto-scale

      // Wait for the logo to load to get its intrinsic dimensions (though not strictly needed for current positioning)
      // This promise will resolve once the logo is fully loaded
      await new Promise((resolve, reject) => {
        logo.onload = () => {
          // Removed estimatedLogoHeight calculation to avoid ReferenceError
          // Removed titleY calculation and text drawing

          // Debugging log
          console.log("Logo loaded inside onload.", { originalWidth: logo.width, originalHeight: logo.height });

          // Resolve the promise now that logo is loaded
          resolve();
        };

        // Handle potential image loading errors
        logo.onerror = (error) => {
            console.error("Error loading logo image:", error);
            // Reject the promise on error so the catch block is triggered
            reject(error);
        };
      })
      
      // Removed previous calculation and log for estimatedLogoHeight (already done, keeping comment)

      // Format the date if it exists
      const formattedDate = formData.date ? new Date(formData.date).toLocaleDateString() : ""

      // Patient details (removed box and adjusted positioning)
      // Use a consistent fixed estimate for positioning below the logo
      const fixedLogoHeightEstimate = 45; // Use a fixed height estimate for positioning (adjust as needed)
      
      // Removed the main "Medical Prescription" title calculation and drawing from here (already done, keeping comment)

      // Adjust vertical positioning for patient details relative to the estimated space below the logo
      // Using titleY calculated above for spacing
      const patientDetailsY = topY + fixedLogoHeightEstimate + 10; // Adjusted spacing after logo

      pdf.setFont(undefined, 'normal'); // Ensure font is normal initially
      pdf.setFontSize(14); // Set font size for patient details
      // pdf.setFont(undefined, 'bold'); // Keep font bold for patient details - Removed

      // Adjusted vertical spacing based on new starting point and larger font size
      const labelX = 30; // X position for labels
      const valueX = 65; // X position for values (adjust as needed)

      // Draw Date label (bold) and value (normal)
      pdf.setFont(undefined, 'bold'); // Set font to bold for label
      pdf.text("Date:", labelX, patientDetailsY);
      pdf.setFont(undefined, 'normal'); // Set font back to normal for value
      pdf.text(`${formattedDate}`, valueX, patientDetailsY);

      // Draw Age label (bold) and value (normal)
      pdf.setFont(undefined, 'bold'); // Set font to bold for label
      pdf.text("Age:", labelX, patientDetailsY + 8); // Use same vertical spacing as before
      pdf.setFont(undefined, 'normal'); // Set font back to normal for value
      pdf.text(`${formData.age}`, valueX, patientDetailsY + 8);

      // Draw Full Name label (bold) and value (normal)
      const fullNameLabelX = 120; // X position for Full Name label (adjust as needed)
      const fullNameValueX = 155; // X position for Full Name value (adjust as needed)
      pdf.setFont(undefined, 'bold'); // Set font to bold for label
      pdf.text("Full Name:", fullNameLabelX, patientDetailsY + 8); // Use same vertical spacing as Age
      pdf.setFont(undefined, 'normal'); // Set font back to normal for value
      pdf.text(`${formData.name}`, fullNameValueX, patientDetailsY + 8);

      // pdf.setFont(undefined, 'normal'); // Added: Reset font back to normal - Removed as font is reset after each value

      // Removed the date display below the inputs as it's in the info box (already done, keeping comment)

      // Add "Medical Prescription" title below patient details and center it
      const medicalPrescriptionTitleY = patientDetailsY + 25; // Adjusted: Increase vertical position below patient details + spacing
      pdf.setFontSize(16); // Adjusted: Increase font size for this title
      pdf.setFont(undefined, 'bold'); // Make the new title bold
      pdf.setTextColor(0, 0, 0) // Set text color to black
      pdf.text("Medical Prescription", pageCenterX, medicalPrescriptionTitleY, { align: "center" }); // Centered title

      // Add table headers for treatments (adjust vertical position)
      // Position headers relative to the new Medical Prescription title
      const tableHeaderY = medicalPrescriptionTitleY + 15; // Adjusted spacing below the new title and some spacing
      pdf.setFontSize(10); // Revert font size for table headers
      pdf.setFont(undefined, 'bold');
      pdf.text("Medicine Name", 30, tableHeaderY);
      pdf.text("Dose", 100, tableHeaderY); // Adjust x position as needed
      pdf.text("Period", 140, tableHeaderY); // Adjust x position as needed

      pdf.setFont(undefined, 'normal'); // Revert to normal font for content

      let yPosition = tableHeaderY + 8; // Revert starting position for treatments below headers
      treatment.forEach((t, index) => {
        // Removed treatment box (already done, keeping comment)
        // pdf.setDrawColor(200, 200, 200)
        // pdf.setFillColor(245, 245, 245)
        // pdf.roundedRect(20, yPosition - 5, 170, 25, 3, 3, 'FD')
        
        pdf.setFontSize(14) // Revert font size for treatment details
        pdf.setTextColor(0, 0, 0) // Set text color to black
        // Display medicine name, dose, and period on the same row
        pdf.text(`${index + 1}. ${t.name}`, 30, yPosition);
        pdf.text(t.dose, 100, yPosition); // Align with Dose header
        pdf.text(t.period, 140, yPosition); // Align with Period header

        yPosition += 8; // Revert vertical spacing between treatment rows
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

  // Update form data when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        name: selectedPatient.fullName || "",
        age: selectedPatient.age || ""
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
          {/* Moved 'Save the report' button down */}
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
              src={Group56Logo} // Use the original logo for the on-page display
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
        {/* Add 'Save the report' button here */} 
        <div className="flex justify-end mt-4">
          <button
            className="bg-primary hover:bg-primary-dark text-white bg-[#008080] px-4 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={generatePDF}
          >
            Save the report
          </button>
        </div>
      </div>
    </section>
  )
}