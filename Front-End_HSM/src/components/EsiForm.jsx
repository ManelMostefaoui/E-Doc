import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { EsiLogo, EsiText } from "../assets"

export default function EsiForm() {
  const [treatment, setTreatment] = useState({ name: "", dose: "", period: "" })

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-xl shadow-md bg-white">
      {/* Header */}
      <div className="flex items-center  pb-4">
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
</div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-2">
          <label className="min-w-[60px] font-medium">Date :</label>
          <input type="date" className="form-input" />
        </div>
       
        <div className="flex items-center gap-2">
          <label className="min-w-[60px] font-medium">Age :</label>
          <input type="number" placeholder="Age" className="form-input" />
        </div>
        <div className="col-span-2 flex relative items-center gap-2">
          <label className="min-w-[90px] font-medium">Full name :</label>
          <input type="text" placeholder="Full name" className="form-input w-full" />
          <button className=" absolute right-2 top-1/2 -translate-y-1/2  hover:text-primary hover:text-blue-500">
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* Treatment Section */}
      <div className="border-t mt-6 pt-4">
        <h2 className="text-xl font-semibold text-center text-teal-800 mb-4">Treatment needed :</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Medicine name"
              value={treatment.name}
              onChange={(e) => setTreatment({ ...treatment, name: e.target.value })}
              className="form-input w-full pr-8"
            />
            <Pencil className="absolute right-8 top-1/2 -translate-y-1/2 " size={16} />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Doze"
              value={treatment.dose}
              onChange={(e) => setTreatment({ ...treatment, dose: e.target.value })}
              className="form-input w-full pr-8"
            />
            <Pencil className="absolute right-8 top-1/2 -translate-y-1/2 " size={16} />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Periode"
              value={treatment.period}
              onChange={(e) => setTreatment({ ...treatment, period: e.target.value })}
              className="form-input w-full pr-8"
            />
            <Trash2 className="absolute right-8 top-1/2 -translate-y-1/2 text-red-600 cursor-pointer" size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}
