import React, { useState, useRef } from 'react';
import axios from 'axios';

const AdminEditUserModal = ({ onClose, onSave, userData }) => {
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    gender: userData?.gender || '',
    birthDate: userData?.birthDate || userData?.birthdate || '',
    phoneNumber: userData?.phoneNumber || userData?.phone_num || '',
    email: userData?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const genders = ['male', 'female'];

  const PenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }

    // Phone number validation
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    // Email validation (@esi-sba.dz)
    if (!formData.email.endsWith('@esi-sba.dz')) {
      newErrors.email = 'Email must end with @esi-sba.dz';
    }

    // Gender validation
    if (!genders.includes(formData.gender.toLowerCase())) {
      newErrors.gender = 'Gender must be either male or female';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        setApiError('');
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setApiError('Authentication required. Please log in again.');
          return;
        }
        
        // Map front-end field names to back-end field names if needed
        const apiData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          gender: formData.gender,
          birthDate: formData.birthDate,
          birthdate: formData.birthDate,
          phoneNumber: formData.phoneNumber,
          phone_num: formData.phoneNumber
        };
        
        // Store the updated admin data in sessionStorage for persistence
        try {
          // Merge with existing data to ensure we don't lose any fields
          const adminKey = 'admin_user_data';
          const existingData = sessionStorage.getItem(adminKey);
          let userData = apiData;
          
          if (existingData) {
            try {
              const parsedData = JSON.parse(existingData);
              userData = {
                ...parsedData,
                ...apiData,
                // Make sure we have both formats of fields for compatibility
                firstName: formData.firstName,
                lastName: formData.lastName,
                name: `${formData.firstName} ${formData.lastName}`,
                birthDate: formData.birthDate,
                birthdate: formData.birthDate,
                phoneNumber: formData.phoneNumber,
                phone_num: formData.phoneNumber
              };
            } catch (err) {
              console.error('Error parsing existing admin data:', err);
            }
          }
          
          // Store the complete admin data
          sessionStorage.setItem(adminKey, JSON.stringify(userData));
          console.log('Stored updated admin data in sessionStorage');
        } catch (err) {
          console.error('Error storing admin data in sessionStorage:', err);
        }
        
        // Call the onSave handler with the updated data
        onSave(apiData);
        
        // Close the modal
        onClose();
      } catch (err) {
        console.error('Error saving admin data:', err);
        setApiError('Error saving your information. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white border border-gray-200 rounded-[15px] relative w-[500px] max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#004d4d] hover:text-gray-600 z-10 bg-white"
          disabled={isSubmitting}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

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

        <div className="p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl text-[#008080] font-medium mb-2">Edit user informations :</h2>
            <p className="text-gray-600 text-sm">
              Update your details below to keep your information accurate and up-to-date. Ensure all fields are correct before saving.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-600 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">First name :</div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {errors.firstName && <div className="text-red-500 text-xs mt-1">{errors.firstName}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Last name :</div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {errors.lastName && <div className="text-red-500 text-xs mt-1">{errors.lastName}</div>}
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
                    disabled={isSubmitting}
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
                  {errors.gender && <div className="text-red-500 text-xs mt-1">{errors.gender}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Birth date :</div>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    name="birthDate"
                    placeholder="YYYY-MM-DD"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8 placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {errors.birthDate && <div className="text-red-500 text-xs mt-1">{errors.birthDate}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Phone number :</div>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone number (10 digits)"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    pattern="\d{10}"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {errors.phoneNumber && <div className="text-red-500 text-xs mt-1">{errors.phoneNumber}</div>}
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Email :</div>
                <div className="flex-1 relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="username@esi-sba.dz"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8"
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-red-600 border border-red-500 rounded-lg hover:bg-red-50 w-[120px]"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-teal-600 rounded-lg hover:bg-teal-700 w-[120px] flex items-center justify-center"
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

export default AdminEditUserModal;
