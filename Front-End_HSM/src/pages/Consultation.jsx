import ConsultationForm from "../components/consultationForm"
import { useLocation } from "react-router-dom"

const Consultation = () => {
  const location = useLocation();
  // Keep selectedPatient from location for initial load if navigated from patient profile
  const selectedPatient = location.state?.selectedPatient;

  return (
    <div className="h-screen overflow-auto bg-white">
      {/* Render ConsultationForm and pass the selected patient */}
      <ConsultationForm selectedPatient={selectedPatient} />
    </div>
  )
}

export default Consultation