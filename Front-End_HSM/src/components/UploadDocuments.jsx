import { useState } from "react"
import { FileText, Trash2, Upload } from "lucide-react"

export default function UploadDocuments() {
  const [files, setFiles] = useState([])

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const pdfFiles = selectedFiles.filter(file => file.type === "application/pdf")
    const newFiles = pdfFiles.map(file => ({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + " Mb",
    }))
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="bg-[#ecf7f7] p-6 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#005353]">Upload documents :</h2>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-4 ">
            <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
            <div className="w-40">
  <select
    id="categorySelect"
    name="categorySelect"
    className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
    defaultValue=""
  >
    <option value="" disabled hidden>
      Select a category
    </option>
    <option value="blood test"> blood test </option>
    <option value="scan x"> scan x  </option>
  </select>
</div>

            <Upload className="text-[#005353] border-[#008080] " />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="border items-center border-gray-200 rounded-lg px-4 py-2 flex justify-between "
          >
            <div className="flex items-center gap-2">
            <FileText color="#008080" />
                <span>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-500">{file.size}</p>

                </span>
              
            </div>
            <button onClick={() => handleRemove(index)} className="text-red-600 hover:text-red-800">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
