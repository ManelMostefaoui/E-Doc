import React, { useState, useEffect } from 'react';
import { Pencil, Ban, Search, Plus } from 'lucide-react';

const sampleMedications = [
  { name: 'Paracetamol', type: 'Tablet', dosage: '500 mg' },
  { name: 'Amoxilin', type: 'Capsule', dosage: '250 mg' },
  { name: 'Ibuprofen', type: 'Tablet', dosage: '400 mg' },
  { name: 'Cetirizine', type: 'Tablet', dosage: '10 mg' },
  { name: 'Metformin', type: 'Tablet', dosage: '500 mg' },
  { name: 'Salbutamol', type: 'Inhaler', dosage: '100 mcg' },
  { name: 'Omeprazol', type: 'Capsule', dosage: '20 mg' },
  { name: 'Azythromicin', type: 'Tablet', dosage: '500 mg' },
  { name: 'Diclofenac', type: 'Injection', dosage: '75 mg / ml' },
  { name: 'loratadine', type: 'Syrup', dosage: '5 mg / ml' },
  { name: 'Atorvastatin', type: 'Tablet', dosage: '10 mg' },
];

export default function Medications() {
  const [search, setSearch] = useState('');
  const [medications, setMedications] = useState(sampleMedications);
  useEffect(() => {
    document.body.style.background = '#f7f9f9';
    return () => { document.body.style.background = ''; };
  }, []);
  const filtered = medications.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (name) => {
    setMedications(medications.filter(m => m.name !== name));
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f9f9] flex flex-col items-center py-8">
      <div className="w-full max-w-full ml-0 md:max-w-4xl md:ml-4">
        <h1 className="text-3xl font-bold text-[#008080] mb-6">Medications :</h1>
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
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
            <button className="flex items-center gap-2 bg-[#008080] text-white px-8 py-2 rounded-xl font-semibold text-lg shadow hover:bg-[#006666] transition-colors w-full md:w-auto md:ml-4">
              <Plus size={20} /> Add new
            </button>
          </div>
          <div className="overflow-x-auto py-4">
            <table className="w-full bg-white rounded-xl shadow-[2px_2px_12px_rgba(0,0,0,0.25)] overflow-hidden text-left text-sm md:text-base">
              <thead>
                <tr className="bg-white text-[#222] text-lg">
                  <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Name</th>
                  <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Type</th>
                  <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Dosage</th>
                  <th className="px-6 py-4 font-semibold border-b" style={{ borderColor: '#004D4D', borderBottomWidth: 1 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((med, idx) => (
                  <tr key={med.name} className="hover:bg-[#f7f9f9]" style={{ borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #004D4D' }}>
                    <td className="px-6 py-3 text-md">{med.name}</td>
                    <td className="px-6 py-3 text-md">{med.type}</td>
                    <td className="px-6 py-3 text-md">{med.dosage}</td>
                    <td className="px-6 py-3 flex gap-4 items-center">
                      <button className="hover:text-[#008080]">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(med.name)}>
                        <Ban size={20} className="text-[#D90429]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
