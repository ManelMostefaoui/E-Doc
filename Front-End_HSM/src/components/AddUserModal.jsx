import React, { useState, useRef } from 'react';
import DefaultUserPhoto from '../assets/DefaultUserPhoto.jpg';

const AddUserModal = ({ onClose, onSave, error }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_name: '',
    birthdate: '',
    phone_num: '',
    address: '',
    gender: '',
    picture: null
  });
  const [localErrors, setLocalErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = ['student', 'teacher', 'employer', 'doctor'];
  const genders = ['male', 'female'];

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    // Phone number validation (exactly 10 digits)
    if (!/^\d{10}$/.test(formData.phone_num)) {
      newErrors.phone_num = 'Phone number must be exactly 10 digits';
    }

    // Email validation (@esi-sba.dz)
    if (!formData.email.endsWith('@esi-sba.dz')) {
      newErrors.email = 'Email must end with @esi-sba.dz';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    // Password confirmation
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    // Gender validation
    if (!genders.includes(formData.gender.toLowerCase())) {
      newErrors.gender = 'Gender must be either male or female';
    }

    // Role validation
    if (!roles.includes(formData.role_name.toLowerCase())) {
      newErrors.role_name = 'Please select a valid role';
    }

    // Additional validation for doctor role
    if (formData.role_name.toLowerCase() === 'doctor') {
      // You can add specific validation for doctors here if needed
      // For example, requiring certain fields or specific formats
    }

    // Birthdate validation
    if (!formData.birthdate) {
      newErrors.birthdate = 'Birth date is required';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        picture: file
      }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  return (
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
          onClick={onClose}
          className="absolute top-4 right-4 text-[#004d4d] hover:text-gray-600 z-10 bg-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <div className="mb-6 flex items-start">
            <div className="relative mr-6">
              <img
                src={previewUrl || DefaultUserPhoto}
                alt="User"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center justify-center gap-1 text-gray-600 text-sm border border-gray-300 rounded-lg p-2 bg-white hover:shadow-md hover:border-[#004d4d] w-full"
              >
                <PenIcon />
                Edit picture
              </button>
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-xl text-[#008080] font-medium mb-2">Add new user :</h2>
              <p className="text-gray-600 text-sm">
                Enter the required information to successfully create and add a new user to your system.
              </p>
            </div>
          </div>

          {/* Display API errors */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Name :</div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.name && <div className="text-red-500 text-xs mt-1">{localErrors.name}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Email :</div>
                <div className="flex-1 relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="example@esi-sba.dz"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.email && <div className="text-red-500 text-xs mt-1">{localErrors.email}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Password :</div>
                <div className="flex-1 relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.password && <div className="text-red-500 text-xs mt-1">{localErrors.password}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Confirm :</div>
                <div className="flex-1 relative">
                  <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm password"
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.password_confirmation && <div className="text-red-500 text-xs mt-1">{localErrors.password_confirmation}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Gender :</div>
                <div className="flex-1 relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8 appearance-none"
                  >
                    <option value="">Select gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.gender && <div className="text-red-500 text-xs mt-1">{localErrors.gender}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Birth date :</div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="birthdate"
                    placeholder="YYYY-MM-DD"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.type = 'date';
                      setShowDatePicker(true);
                    }}
                    onBlur={(e) => {
                      if (!formData.birthdate) {
                        e.target.type = 'text';
                      }
                      setShowDatePicker(false);
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.birthdate && <div className="text-red-500 text-xs mt-1">{localErrors.birthdate}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Phone :</div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="phone_num"
                    placeholder="0567849321"
                    value={formData.phone_num}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.phone_num && <div className="text-red-500 text-xs mt-1">{localErrors.phone_num}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Address :</div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.address && <div className="text-red-500 text-xs mt-1">{localErrors.address}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Role :</div>
                <div className="flex-1 relative">
                  <select
                    name="role_name"
                    value={formData.role_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8 appearance-none"
                  >
                    <option value="">Select role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {localErrors.role_name && <div className="text-red-500 text-xs mt-1">{localErrors.role_name}</div>}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
