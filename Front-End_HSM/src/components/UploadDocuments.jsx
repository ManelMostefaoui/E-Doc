import { useState } from "react"
import { FileText, Trash2, Upload } from "lucide-react"
import axios from "axios";

export default function UploadDocuments() {
  const [files, setFiles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const pdfFiles = selectedFiles.filter(file => file.type === "application/pdf")
    const newFiles = pdfFiles.map(file => ({
      file: file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + " Mb",
    }))
    setFiles(prev => [...prev, ...newFiles])
    setUploadError(null)
    setUploadSuccess(false)
  }

  const handleRemove = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value)
    setUploadError(null)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadError("Please select at least one file to upload.")
      return
    }
    if (!selectedCategory) {
      setUploadError("Please select a category for the documents.")
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    const formData = new FormData()
    files.forEach(fileItem => {
      formData.append('documents[]', fileItem.file)
    })
    formData.append('category', selectedCategory)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8000/api/documents/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log('Upload response:', response.data)
      setUploadSuccess(true)
      setFiles([])
      setSelectedCategory("")

    } catch (error) {
      console.error('Error uploading documents:', error)
      let errorMessage = "Failed to upload documents."
      if (error.response) {
        errorMessage += ` Server error: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`
      } else if (error.request) {
        errorMessage += " No response from server. Please check your internet connection."
      } else {
        errorMessage += ` Error details: ${error.message}`
      }
      setUploadError(errorMessage)
      setUploadSuccess(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 rounded-lg space-y-4">
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
    value={selectedCategory}
    onChange={handleCategoryChange}
  >
    <option value="" disabled>
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

      {uploading && <div className="text-blue-600 text-sm">Uploading...</div>}
      {uploadSuccess && <div className="text-green-600 text-sm">Upload successful!</div>}
      {uploadError && <div className="text-red-600 text-sm">{uploadError}</div>}

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

      {files.length > 0 && selectedCategory && (
            <button
                onClick={handleUpload}
                disabled={uploading}
                className={
                    `mt-4 px-6 py-2 rounded-md text-white ${uploading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`
                }
            >
                {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
        )}

    </div>
  )
}
