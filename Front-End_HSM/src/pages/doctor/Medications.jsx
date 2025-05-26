import React, { useState, useEffect } from 'react';
import { Pencil, Ban, Search, X } from 'lucide-react';
import axios from 'axios';

export default function Medications() {
  const [search, setSearch] = useState('');
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    dosage: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const API_BASE_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    document.body.style.background = '#f7f9f9';
    return () => { document.body.style.background = ''; };
  }, []);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');

        const response = await axios.get(`${API_BASE_URL}/medications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        setMedications(response.data);
      } catch (err) {
        console.error('Error fetching medications:', err);
        setError(err.response?.data?.message || 'Failed to fetch medications');
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  const filtered = medications.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Attempting to delete medication with ID:', id);
      console.log('DELETE request URL:', `${API_BASE_URL}/medications/${id}`);
      console.log('Token present for delete:', !!token);
      await axios.delete(`${API_BASE_URL}/medications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      setMedications(medications.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting medication:', err);
      setError(err.response?.data?.message || 'Failed to delete medication');
    }
  };

  const handleEdit = (medication) => {
    setEditingMedication(medication);
    setEditForm({
      name: medication.name,
      category: medication.category,
      dosage: medication.dosage
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Attempting to update medication with ID:', editingMedication.id);
      console.log('PUT request URL:', `${API_BASE_URL}/medications/${editingMedication.id}`);
      console.log('Token present for update:', !!token);
      const response = await axios.put(
        `${API_BASE_URL}/medications/${editingMedication.id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      setMedications(medications.map(med =>
        med.id === editingMedication.id ? response.data : med
      ));
      setIsEditModalOpen(false);
      setEditingMedication(null);
    } catch (err) {
      console.error('Error updating medication:', err);
      setError(err.response?.data?.message || 'Failed to update medication');
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleImportSubmit = async () => {
    if (!selectedFile) {
      alert('Please select an Excel file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      console.log('Attempting to import file:', selectedFile.name);
      console.log('POST request URL:', `${API_BASE_URL}/medications/import`);
      console.log('Token present for import:', !!token);

      await axios.post(`${API_BASE_URL}/medications/import`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Medications imported successfully!');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error importing medications:', err);
      setError(err.response?.data?.message || 'Failed to import medications');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f7f9f9] flex items-center justify-center">
        <div className="text-[#008080] text-xl">Loading medications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#f7f9f9] flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f9f9] flex flex-col items-center py-8">
      <div className="w-full max-w-full ml-0 md:max-w-4xl md:ml-4">
        <h1 className="text-3xl font-bold text-[#008080] mb-6">Medications :</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white text-gray-700 text-lg border-0"
              />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {selectedFile && (
              <span className="text-sm text-gray-600">Selected: {selectedFile.name}</span>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <button
              onClick={selectedFile ? handleImportSubmit : handleImportClick}
              className="px-4 py-2 bg-[#008080] text-white rounded-2xl shadow-lg hover:bg-[#006666] focus:outline-none focus:ring-2 focus:ring-[#008080]"
            >
              {selectedFile ? 'Upload File' : 'Import Medications'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto py-4">
          <table className="w-full bg-white rounded-xl shadow-[2px_2px_12px_rgba(0,0,0,0.25)] overflow-hidden text-left text-sm md:text-base">
            <thead>
              <tr className="bg-white text-[#222] text-lg">
                <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Name</th>
                <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Category</th>
                <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Dosage</th>
                <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((med, idx) => (
                <tr key={med.id} className="hover:bg-[#f7f9f9]" style={{ borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #004D4D' }}>
                  <td className="px-6 py-3 text-md">{med.name}</td>
                  <td className="px-6 py-3 text-md">{med.category}</td>
                  <td className="px-6 py-3 text-md">{med.dosage}</td>
                  <td className="px-6 py-3 flex gap-4 items-center">
                    <button
                      className="hover:text-[#008080]"
                      onClick={() => handleEdit(med)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(med.id)}>
                      <Ban size={20} className="text-[#D90429]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white border border-gray-200 rounded-[15px] relative w-[500px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            <style jsx global>{`
              .scrollbar-thin::-webkit-scrollbar {
                width: 6px;
              }
              .scrollbar-thin::-webkit-scrollbar-track {
                background: transparent;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb {
                background-color: #E5E7EB;
                border-radius: 3px;
              }
              .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                background-color: #D1D5DB;
              }
              .scrollbar-thin {
                scrollbar-width: thin;
                scrollbar-color: #E5E7EB transparent;
              }
            `}</style>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-[#004d4d] hover:text-gray-600 z-10 bg-white"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-xl text-[#008080] font-medium mb-2">Edit Medication</h2>
                <p className="text-gray-600 text-sm">
                  Modify the medication information as needed.
                </p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="flex items-center">
                  <div className="w-[90px] text-black text-sm">Name :</div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <Pencil size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-[90px] text-black text-sm">Category :</div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <Pencil size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-[90px] text-black text-sm">Dosage :</div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={editForm.dosage}
                      onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <Pencil size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
