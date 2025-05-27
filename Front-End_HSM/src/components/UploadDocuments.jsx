import { useState, useEffect } from "react"
import { FileText, Trash2, Upload, Eye, X } from "lucide-react"
import axios from "axios";

export default function UploadDocuments({ patientId }) {
  const [files, setFiles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showViewer, setShowViewer] = useState(false)

  // Define fetchDocuments outside of useEffect
  const fetchDocuments = async () => {
    if (!patientId) {
      setUploadedDocuments([]);
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

      const response = await axios.get(`/api/documents/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

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

  useEffect(() => {
    fetchDocuments();
  }, [patientId]);

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

  const handleViewDocument = (doc) => {
    // Construct the full URL for the document
    const documentUrl = `${axios.defaults.baseURL}/storage/${doc.document}`;
    setSelectedDocument({ ...doc, file_url: documentUrl }); // Store the full URL
    setShowViewer(true);
  }

  const handleCloseViewer = () => {
    setShowViewer(false);
    setSelectedDocument(null);
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

    const uploadPromises = files.map(async (fileItem) => {
      const formData = new FormData();
      formData.append('document', fileItem.file);
      formData.append('title', selectedCategory);
      formData.append('patient_id', patientId);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/documents/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });
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

    const results = await Promise.all(uploadPromises);
    const allSuccessful = results.every(result => result.success);

    if (allSuccessful) {
      setUploadSuccess(true);
      setUploadError(null);
      setFiles([]);
      setSelectedCategory("");
      fetchDocuments();
    } else {
      const failedUploads = results.filter(result => !result.success);
      const errorMessages = failedUploads.map(f => f.error).join('\n');
      setUploadError("Some files failed to upload:\n" + errorMessages);
      setUploadSuccess(false);
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
                <option value="blood test">Blood Test</option>
                <option value="scan x">X-Ray</option>
                <option value="ct-scan">CT Scan</option>
                <option value="mri">MRI</option>
                <option value="other">Other</option>
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

      {loadingDocuments && <div className="text-blue-600 text-sm">Loading documents...</div>}

      {!loadingDocuments && uploadedDocuments.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h3 className="col-span-full text-md font-semibold text-gray-700">Uploaded Documents:</h3>
          {uploadedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="border items-center border-gray-200 rounded-lg px-4 py-2 flex justify-between"
            >
              <div className="flex items-center gap-2">
                <FileText color="#008080" />
                <span>
                  <p className="text-sm font-medium text-gray-800">{doc.title || doc.name || 'Unnamed Document'}</p>
                  {doc.category && <p className="text-xs text-gray-500">Category: {doc.category}</p>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="text-teal-600 hover:text-teal-800"
                  title="View Document"
                >
                  <Eye size={20} />
                </button>
                {doc.document && (
                  <a
                    href={`${axios.defaults.baseURL}/storage/${doc.document}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800"
                    title="Download Document"
                  >
                    Download
                  </a>
                )}
                <button onClick={() => handleRemove(doc.id)} className="text-red-600 hover:text-red-800" title="Delete Document">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingDocuments && uploadedDocuments.length === 0 && patientId && (
        <div className="text-gray-500 text-sm">No documents uploaded for this patient yet.</div>
      )}
      {!patientId && !loadingDocuments && (
        <div className="text-gray-500 text-sm">Select a patient to view and upload documents.</div>
      )}

      {files.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h3 className="col-span-full text-md font-semibold text-gray-700">Files to Upload:</h3>
          {files.map((file, index) => (
            <div
              key={index}
              className="border items-center border-gray-200 rounded-lg px-4 py-2 flex justify-between"
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
          className={`mt-4 px-6 py-2 rounded-md text-white ${uploading ? 'bg-gray-400' : 'bg-teal-600 hover:bg-teal-700'}`}
        >
          Upload Files
        </button>
      )}

      {/* Document Viewer Modal */}
      {showViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-11/12 h-5/6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedDocument.title || 'Document Viewer'}</h3>
              <button onClick={handleCloseViewer} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedDocument?.file_url}
                className="w-full h-full"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
