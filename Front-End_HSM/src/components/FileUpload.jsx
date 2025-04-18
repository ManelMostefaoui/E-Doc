import { useState } from "react";
import { FileText, Trash, Upload, Search, ChevronDown, X } from "lucide-react";

const FileUpload = () => {
  const [files, setFiles] = useState([]); // Store uploaded files
  const [error, setError] = useState(""); // Store error messages
  const [filter, setFilter] = useState(""); // Search term
  const [category, setCategory] = useState(""); // Selected category for uploading
  const [filterCategory, setFilterCategory] = useState(""); // Selected category for filtering
  const [selectedFile, setSelectedFile] = useState(null); // File selected for deletion
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility

  const categories = ["X-ray", "Blood test", "CT Scan", "MRI", "Other"]; // Predefined categories

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("❌ Only PDF files are allowed!");
      return;
    }

    if (!category) {
      setError("❌ Please select a category before uploading!");
      return;
    }

    const newFile = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2), // Convert size to MB
      category,
    };

    setFiles([...files, newFile]);
    setError("");
  };

  // Function to open delete confirmation modal
  const openDeleteModal = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  // Function to remove a file after confirmation
  const confirmDelete = () => {
    setFiles(files.filter((file) => file.name !== selectedFile.name));
    setIsModalOpen(false);
  };

  return (
    <div className="py-6 max-w-2xl mx-auto font-nunito text-[16px] text-[#495057]">
      
      {/* Search & Category Filter */}
      <div className="flex gap-4 mb-5">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search files..."
            className="w-full px-6 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#008080]"
            onChange={(e) => setFilter(e.target.value.toLowerCase())}
          />
          <Search className="absolute right-6 top-4 text-gray-500" size={18} />
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative w-fit">
          <select
            className="px-6 py-3 pr-12 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#008080]"
            onChange={(e) => setFilterCategory(e.target.value)}
            value={filterCategory}
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Category Selection for Uploading */}
      <div className="mb-4 relative">
        <label className="block text-[#1A1A1A] mb-3">Select Category:</label>

        <div className="relative w-fit">
          <select
            className="px-6 py-3 pr-12 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#008080]"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            <option value="">-- Choose a category --</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>

          <ChevronDown 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
            size={20} 
          />
        </div>
      </div>

      {/* Upload Button */}
      <div className="flex gap-4 mb-3">
        <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="fileInput" />
        <label htmlFor="fileInput" className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition">
          <Upload size={16} />
          Upload PDF
        </label>
      </div>

      {/* Uploaded Files List */}
      <div className="space-y-3">
        {files
          .filter((file) => file.name.toLowerCase().includes(filter)) // Filter by search
          .filter((file) => !filterCategory || file.category === filterCategory) // Filter by category
          .map((file, index) => (
            <div key={index} className="flex items-center justify-between border border-[#495057] rounded-lg px-8 py-6">
              <div className="flex items-center gap-6">
                <div className="text-[#008080]">
                  <FileText size={22} />
                </div>
                <div className="font-nunito text-[16px]">
                  <p className="text-[#1A1A1A]">{file.name}</p>
                  <p className="text-[#495057]">{file.category} - {file.size} Mb</p>
                </div>
              </div>

              <button className="text-[#c5283d]" onClick={() => openDeleteModal(file)}>
                <Trash size={22} />
              </button>
            </div>
          ))}
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-10 backdrop-blur-md">
          <div className="bg-[#f7f9f9] py-10 px-15 rounded-lg shadow-lg border border-gray-200 w-140 ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-montserat text-[20px] text-[#008080] font-bold">Confirm Deletion</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <p>Are you sure you want to delete <strong>{selectedFile.name}</strong>?</p>

            <div className="flex justify-center space-x-4 mt-8">
              <button className="text-[#008080]  font-semibold flex items-center gap-4 border-2 border-[#008080] rounded-lg px-7 py-2 hover:text-[#F7F9F9] hover:bg-[#008080] transition duration-150" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="text-[#f7f9f9] bg-[#C5283D]  font-semibold flex items-center gap-4 border-[#C5283D] rounded-lg px-7 py-2  hover:bg-[#A52033] transition duration-150" onClick={confirmDelete}>
                Delete
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
