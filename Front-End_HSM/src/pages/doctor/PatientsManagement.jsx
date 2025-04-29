import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import PatientTable from "../../components/CDoctor/PatientTable";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PatientsManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/patients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

      } catch (err) {
        console.error('Error checking user role:', err);
        navigate('/login');
      }
    };

    checkAccess();
  }, [navigate]);

  // Function to generate a unique ID for patients missing one
  const generateUniqueId = (patient) => {
    return `p_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  };

  // Function to ensure a patient has an ID
  const ensurePatientHasId = (patient) => {
    if (!patient) {
      console.error('Cannot assign ID to null or undefined patient');
      return null;
    }
    
    const patientId = patient.id || patient._id || patient.patient_id || (patient.patient ? patient.patient.id : null);
    
    console.log('Checking patient ID status:', { 
      email: patient.email, 
      id: patientId, 
      hasId: !!patientId
    });
    
    if (!patientId) {
      const generatedId = generateUniqueId(patient);
      console.log('Generating ID for patient without ID:', {
        email: patient.email,
        generatedId: generatedId
      });
      
      const patientWithId = {
        ...patient,
        id: generatedId,
        status: patient.status || "Activated"
      };
      
      try {
        sessionStorage.setItem('tempPatient_' + generatedId, JSON.stringify(patientWithId));
        console.log('Successfully stored patient in sessionStorage with ID:', generatedId);
      } catch (error) {
        console.error('Failed to store patient in sessionStorage:', error);
      }
      
      return patientWithId;
    }
    
    const patientWithStandardId = {
      ...patient,
      id: patientId,
      status: patient.status || "Activated"
    };
    
    try {
      sessionStorage.setItem('tempPatient_' + patientId, JSON.stringify(patientWithStandardId));
      console.log('Stored patient with existing ID in sessionStorage:', patientId);
    } catch (error) {
      console.error('Failed to store patient in sessionStorage:', error);
    }
    
    return patientWithStandardId;
  };

  // Function to try to match patients with generated IDs to backend patients
  const matchGeneratedPatients = (backendPatients, currentPatients) => {
    const generatedPatients = currentPatients.filter(patient => patient.id && patient.id.toString().startsWith('p_'));
    
    if (generatedPatients.length === 0) {
      return backendPatients;
    }
    
    console.log('Attempting to match generated IDs with backend patients...');
    
    const updatedPatients = [...backendPatients];
    let matchCount = 0;
    
    generatedPatients.forEach(genPatient => {
      if (!genPatient.id.toString().startsWith('p_')) return;
      
      const backendMatch = backendPatients.find(bp => 
        bp.email && genPatient.email && bp.email.toLowerCase() === genPatient.email.toLowerCase()
      );
      
      if (backendMatch && backendMatch.id) {
        console.log(`Found backend match for patient ${genPatient.email}`);
        
        const updatedPatient = {
          ...genPatient,
          id: backendMatch.id
        };
        
        sessionStorage.removeItem('tempPatient_' + genPatient.id);
        
        const backendPatientIndex = updatedPatients.findIndex(p => p.id === backendMatch.id);
        if (backendPatientIndex !== -1) {
          updatedPatients.splice(backendPatientIndex, 1);
        }
        
        updatedPatients.push(updatedPatient);
        matchCount++;
      }
    });
    
    if (matchCount > 0) {
      console.log(`Matched ${matchCount} patients with backend IDs`);
    }
    
    return updatedPatients;
  };

  // Function to calculate age from birthdate
  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Function to refresh the patients list
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8000/api/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Fetch patients response:', response.data);
      
      let backendPatients = response.data
        .filter(user => !user.role || user.role.toLowerCase() !== 'admin')
        .map(patient => ensurePatientHasId(patient));
      
      let formattedPatients = matchGeneratedPatients(backendPatients, patients);
      formattedPatients = formattedPatients.map(patient => ensurePatientHasId(patient));

      // Map to only required fields for the table, extracting from patient.user
      const mappedPatients = formattedPatients.map(patient => {
        const user = patient.user || {};
        return {
          id: patient.id, // <-- Use patient.id here!
          fullName: user.name || '',
          age: user.birthdate ? calculateAge(user.birthdate) : '',
          gender: user.gender || '',
          email: user.email || '',
          urgentContact: user.phone_num || '',
        };
      });

      setPatients(mappedPatients);
      setError("");
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError("Failed to load patients data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchPatients();
  }, [navigate, selectedFilter]);

  const handlePatientSelect = (patient) => {
    if (patient && patient.id) {
      navigate(`/patients/${patient.id}`);
    } else {
      alert("Patient ID is missing!");
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[#0a8a8a]">Patients Management</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-[400px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a8a8a] shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Role Filter */}
          <div className="relative">
            <select
              className="appearance-none flex items-center gap-2 px-4 py-2 pr-8 rounded-full bg-white border border-gray-200"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="All">All Patients</option>
              <option value="Student">Students</option>
              <option value="Teacher">Teachers</option>
              <option value="Employer">Employers</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <PatientTable patients={patients} onPatientSelect={handlePatientSelect} />
        )}
      </div>
    </div>
  );
};

export default PatientsManagement;