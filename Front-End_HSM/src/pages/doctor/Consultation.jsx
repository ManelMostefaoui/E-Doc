import ConsultationForm from "../../components/consultationForm"
import { useLocation } from "react-router-dom"
import { useEffect } from 'react';

const Consultation = () => {
  const location = useLocation();
  // Keep selectedPatient from location for initial load if navigated from patient profile
  const selectedPatient = location.state?.selectedPatient;

  // Set body background color
  useEffect(() => {
    document.body.style.background = '#f7f9f9';
    return () => { document.body.style.background = ''; };
  }, []);

  return (
    <div className="h-full">
      {/* Render ConsultationForm and pass the selected patient */}
      <ConsultationForm selectedPatient={selectedPatient} />
    </div>
  )
}

export default Consultation