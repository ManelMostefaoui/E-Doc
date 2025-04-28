import Editbtn from "../../components/Editbtn"
import FileUpload from "../../components/FileUpload"
import {
  Calendar,
  Download,
  Edit,
  FileText,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  Mail,
  Shield,
  Droplet,
  Trash
} from "lucide-react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"


export default function PatientProfile() {
  const { id: patientId } = useParams();
  const [patient, setPatient] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/patients/${patientid}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('Patient data:', response.data);
        setPatient(response.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError("Failed to load patient data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientData();
  }, [patientId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="space-y-6">

      {/* Patient header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="p-0.5 w-20 h-20 rounded-full overflow-hidden border-4 border-[#008080]">
          <img src={patient.picture || "/prfl.jpg"} alt="Patient profile" className="w-full h-full object-cover rounded-full" />
        </div>

        <div space-y-4>
          <h1 className="font-nunito text-[20px] text-[#1a1a1a] font-semibold">{patient.name || "Patient Name"}</h1>
          <p className="font-nunito text-[20px] text-[#495057]">{patient.role || "Patient"}</p>
        </div>
      </div>

      {/* Information cards - 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Basic information */}
        <div className="px-10 py-8 bg-gradient-to-b from-[#F7F9F9] to-[#A7E8E8] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">

          <div className="flex justify-between items-center ">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Basic informations</h2>
            <Editbtn text="Edit Basic infos" />
          </div>

          <div className="py-4">
            <div className="space-y-6">

              <div className="flex items-start gap-6">
                <User size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Gender :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.gender || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Calendar size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Date and birthday place :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.birthdate || "Not specified"} {patient.birthplace || ""}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Phone size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Phone number :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.phone_num || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Mail size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Email :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.email || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Shield size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Social security number :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.SSN || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <Droplet size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Blood type :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.blood_type || "Not specified"}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <MapPin size={18} className="text-[#495057] mt-3" />
                <div className="space-y-1">
                  <p className="font-nunito text-[16px] font-light text-[#495057]">Address :</p>
                  <p className="font-nunito text-[16px] text-[#1A1A1A]">{patient.address || "Not specified"}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Personal History */}
<div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)] ">

<div className="flex justify-between items-center">
  <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">
    Personal History
  </h2>
  <Editbtn text="Edit Personal History" />
</div>

<div className="font-nunito text-[16px] text-[#1A1A1A] py-6">
  <div className="space-y-6 py-3">
    <div>
      <p className="text-[#495057]">Tobacco :</p>
      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-2 ">
          <p className="font-semibold">Smoking : <span className="font-normal">yes</span></p>
          <p className="font-semibold">Cigarettes per day : <span className="font-normal">1</span></p>
        </div>

         <div className="grid grid-cols-2 gap-2 ">
           <p className="font-semibold">Chewing tobacco : <span className="font-normal">yes</span></p> 
           <p className="font-semibold">Number of boxes : <span className="font-normal">1</span></p>
         </div>

          <p className="font-semibold">Other forms : <span className="font-normal">yes</span></p>
          <p className="font-semibold">Age at first use : <span className="font-normal">18 yo</span></p>
        
          <div className="grid grid-cols-2 gap-2 ">
           <p className="font-semibold">Former smoker : <span className="font-normal">yes</span></p>
           <p className="font-semibold">Quit date : <span className="font-normal">20/02/2023</span></p>
           </div>
        </div>
       </div>

       <div className="font-nunito text-[16px] text-[#1A1A1A] space-y-4 py-5">
        <p className="text-[#495057]">Alcohol :</p>
        <div className="grid grid-cols-2 gap-2 mt-4">
        <p className="font-semibold">Consumption : <span className="font-normal">No</span></p>
        <p className="font-semibold">Period of exposure : <span className="font-normal">empty</span></p>
        </div>
      </div>

    <div className="font-nunito text-[16px] text-[#1A1A1A] space-y-4">
      <p className="text-[#495057]">Medications :</p>
      <p className="mt-4 font-semibold">Current medications : <span className="font-normal">empty</span></p>
      <p className="font-semibold mt-2">Past medications : <span className="font-normal">empty</span></p>
    </div>
    <button className="text-[#008080] hover:font-semibold transition duration-150">-View more details-</button>
  </div>
</div>
</div>


        {/* Agreement of documents */}
        <div className="h-[500px] overflow-y-auto  px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)] scrollbar-hide">
          <div className="flex justify-between items-center ">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Agreement of documents</h2>
          </div>
          <FileUpload />
        </div>


        {/* Medical History */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center ">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Medical History</h2>
            <Editbtn text="Edit Medical History" />
          </div>

          <div className="py-4">
            <div className="space-y-6 font-nunito text-[16px]">
              <div>
                <p className="text-[#495057]">Congenital condition :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  <li>Congenital heart defect</li>
                </ul>
              </div>

              <div>
                <p className="text-[#495057]">General diseases :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  <li>Diabetes</li>
                </ul>
              </div>

              <div>
                <p className="text-[#495057]">Surgical interventions :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  <li>Appendectomy (05/2018)</li>
                </ul>
              </div>

              <div>
                <p className="text-[#495057]">Allergic reactions :</p>
                <ul className="mt-3 ml-5 list-disc text-[#1A1A1A]">
                  <li>Peanuts</li>
                </ul>
              </div>

              <button className="text-[#008080] hover:font-semibold transition duration-150">-View more details-</button>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Appoitements</h2>
          </div>

          <div className="p-4">
            <div className="flex justify-between mb-4">
              <div className="relative w-full max-w-xs">
                <input type="text" placeholder="Search" className="w-full pl-9 pr-3 py-2 border rounded-md" />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button className="bg-[#008080] text-white rounded-md p-1.5">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative pl-6 border-l-2 border-[#008080]">
              {[1, 2, 3].map((item, index) => (
                <div key={index} className="mb-6 relative">
                  <div className="absolute -left-[22px] top-0 w-4 h-4 rounded-full bg-[#008080]"></div>
                  <p className="text-sm text-[#495057] mb-2">05 Sep 2025 - 09:06</p>
                  <div className="border rounded-md p-3 mb-2">
                    <p className="text-sm">
                      Reason of visit : <span className="font-medium">General check</span>
                    </p>
                  </div>

                  <button className="bg-[#008080] text-white text-sm rounded-md px-3 py-2 w-full">
                    Summary of consultation
                  </button>

                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health & Clinical Data */}
        <div className="px-10 py-8 bg-[#F7F9F9] rounded-lg shadow-[2px_2px_12px_rgba(0,0,0,0.25)]">
          <div className="flex justify-between items-center">
            <h2 className="font-nunito text-[20px] text-[#004d4d] font-bold">Health & Clinical Data</h2>
            <Editbtn text="Health And Clinic" />
          </div>

          <div className="py-3">
            <div className="space-y-5 font-nunito text-[16px]">
              
                <p className="font-semibold">Height : <span className="font-normal">164 cm</span></p>
                <p className="font-semibold"> Weight : <span className="font-normal">62 kg</span></p>
                <p className="font-semibold">Hearing Issues : <span className="font-normal">Normal</span></p>
                <p className="font-semibold">Vision Issues : <span className="font-normal">Normal</span></p>
              <p className="font-semibold">Skin Conditions : <span className="font-normal">No</span></p>
              <p className="font-semibold">Musculoskeletal Issues : <span className="font-normal">No</span></p>
              <p className="font-semibold"> Respiratory Problems : <span className="font-normal">No</span></p>
              <p className="font-semibold">Cardiovascular Problems : <span className="font-normal">No</span></p>
              <p className="font-semibold">Digestive Issues : <span className="font-normal">No</span></p>
              <p className="font-semibold">Oral Health Problems : <span className="font-normal">No</span></p>
              <p className="font-semibold">Genitourinary Issues : <span className="font-normal">No</span></p>
              <p className="font-semibold">Neurological Symptoms : <span className="font-normal">No</span></p>

              <button className="text-[#008080] hover:font-semibold transition duration-150">-View more details-</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  )
}

