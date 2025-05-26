import { useState, useEffect } from "react"
import { FileText, Trash2, Upload } from "lucide-react"
import axios from "axios";

export default function UploadDocuments({ patientId }) {
  const [files, setFiles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // New state for documents already uploaded and fetched from the backend
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  // Define fetchDocuments outside of useEffect
  const fetchDocuments = async () => {
    if (!patientId) {
      setUploadedDocuments([]); // Clear documents if no patient is selected
      setLoadingDocuments(false);
      return;
    }

    setLoadingDocuments(true);
    setFetchError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFetchError("Authentication token not found. Please log in.");
        setLoadingDocuments(false);
        return;
      }

      // First get the list of documents for this patient
      const response = await axios.get(`http://localhost:8000/api/documents/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      console.log('Fetched documents list:', response.data);

      if (response.data && Array.isArray(response.data)) {
        setUploadedDocuments(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setUploadedDocuments(response.data.data);
      } else {
        console.warn("Unexpected data format for fetched documents:", response.data);
        setUploadedDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      let errorMessage = "Failed to fetch documents.";
      if (error.response) {
        errorMessage += ` Server error: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage += " No response from server. Please check your internet connection.";
      } else {
        errorMessage += ` Error details: ${error.message}`;
      }
      setFetchError(errorMessage);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Effect to fetch documents when patientId changes - now just calls the function
  useEffect(() => {
    fetchDocuments();
  }, [patientId]); // Re-run effect when patientId changes

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
    if (!patientId) {
      setUploadError("Please select a patient first to upload documents.")
      return
    }
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

    // Process each file individually to match backend expectation of a single 'document'
    const uploadPromises = files.map(async (fileItem) => {
      const formData = new FormData();
      formData.append('document', fileItem.file); // Use singular 'document' key
      formData.append('title', selectedCategory); // Send selected category as 'title'
      // Include patient_id with the upload request
      formData.append('patient_id', patientId);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:8000/api/documents/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`Upload response for ${fileItem.name}:`, response.data);
        return { name: fileItem.name, success: true, response: response.data };
      } catch (error) {
        console.error(`Error uploading ${fileItem.name}:`, error);
        let errorMessage = `Failed to upload ${fileItem.name}.`;
        if (error.response) {
          errorMessage += ` Server error: ${error.response.status} - ${error.response.data?.message || JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          errorMessage += " No response from server. Please check your internet connection.";
        } else {
          errorMessage += ` Error details: ${error.message}`;
        }
        return { name: fileItem.name, success: false, error: errorMessage };
      }
    });

    // Wait for all upload promises to resolve
    const results = await Promise.all(uploadPromises);

    // Check if all uploads were successful
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      setUploadSuccess(true);
      setUploadError(null);
      setFiles([]); // Clear files only on full success
      setSelectedCategory("");
      // Re-fetch the list of uploaded documents after successful upload
      fetchDocuments();
    } else {
      // Report errors for failed uploads
      const failedUploads = results.filter(result => !result.success);
      const errorMessages = failedUploads.map(f => f.error).join('\n');
      setUploadError("Some files failed to upload:\n" + errorMessages);
      setUploadSuccess(false);
      // Optionally, keep failed files in the list or remove them
    }

    setUploading(false);
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
                <option value="Ct-scan"> Ct-scan </option>
              </select>
            </div>

            <Upload className="text-[#005353] border-[#008080] " />
          </label>
        </div>
      </div>

      {uploading && <div className="text-blue-600 text-sm">Uploading...</div>}
      {uploadSuccess && <div className="text-green-600 text-sm">Upload successful!</div>}
      {uploadError && <div className="text-red-600 text-sm">{uploadError}</div>}
      {fetchError && <div className="text-red-600 text-sm">{fetchError}</div>}

      {/* Display loading state for fetched documents */}
      {loadingDocuments && <div className="text-blue-600 text-sm">Loading documents...</div>}

      {/* Display fetched documents */}
      {!loadingDocuments && uploadedDocuments.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h3 className="col-span-full text-md font-semibold text-gray-700">Uploaded Documents:</h3>
          {uploadedDocuments.map((doc) => (
            <div
              key={doc.id} // Assuming each document has a unique ID
              className="border items-center border-gray-200 rounded-lg px-4 py-2 flex justify-between "
            >
              <div className="flex items-center gap-2">
                <FileText color="#008080" />
                <span>
                  {/* Display document title/name and category if available */}
                  <p className="text-sm font-medium text-gray-800">{doc.title || doc.name || 'Unnamed Document'}</p>
                  {/* Assuming category might be available on fetched document object */}
                  {doc.category && <p className="text-xs text-gray-500">Category: {doc.category}</p>}
                </span>
              </div>
              {/* Option to download the document */}
              {doc.file_path && (
                <a
                  href={`http://localhost:8000/storage/${doc.file_path}`} // Adjust URL based on your backend storage path
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-800 mr-2"
                  title="Download Document"
                >
                  Download
                </a>
              )}

              {/* Option to delete the document */}
              <button onClick={() => handleRemoveUploaded(doc.id)} className="text-red-600 hover:text-red-800" title="Delete Document">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Display message if no documents are uploaded */}
      {!loadingDocuments && uploadedDocuments.length === 0 && patientId && (
        <div className="text-gray-500 text-sm">No documents uploaded for this patient yet.</div>
      )}
      {!patientId && !loadingDocuments && (
        <div className="text-gray-500 text-sm">Select a patient to view and upload documents.</div>
      )}

      {/* Display files selected for upload (before uploading) */}
      {files.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h3 className="col-span-full text-md font-semibold text-gray-700">Files to Upload:</h3>
          {files.map((file, index) => (
            <div
              key={index} // Using index as key for files to upload
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
      )}

      {files.length > 0 && selectedCategory && !uploading && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={
            `mt-4 px-6 py-2 rounded-md text-white ${uploading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`
          }
        >
          Upload Files
        </button>
      )}

    </div>
  )
}
