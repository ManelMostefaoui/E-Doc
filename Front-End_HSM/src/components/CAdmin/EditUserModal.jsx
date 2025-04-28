import React, { useState, useRef } from 'react';
import axios from 'axios';
import DefaultUserPhoto from '../../assets/DefaultUserPhoto.jpg';

const EditUserModal = ({ onClose, onSave, userData }) => {
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    gender: userData?.gender || '',
    birthDate: userData?.birthDate || '',
    phoneNumber: userData?.phoneNumber || '',
    email: userData?.email || '',
    role: userData?.role || '',
    address: userData?.address || ''
  });
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteIsSubmitting, setDeleteIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const roles = ['student', 'teacher', 'employer', 'doctor'];
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

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
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
        
        const token = localStorage.getItem('token');
        if (!token) {
          setApiError('Authentication required. Please log in again.');
          return;
        }
        
        // Map front-end field names to back-end field names
        const apiData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          gender: formData.gender,
          birthdate: formData.birthDate,
          phone_num: formData.phoneNumber,
          address: formData.address,
          role_name: formData.role
        };
        
        // For regular IDs, create request data
        let requestData = apiData;
        let headers = {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        
        // Check if this is a generated ID (starts with u_)
        const isGeneratedId = userData.id && userData.id.toString().startsWith('u_');
        
        // For generated IDs, we don't make a PUT request to the API
        // Instead, we update the data in sessionStorage
        if (isGeneratedId) {
          try {
            // Get the current user data from sessionStorage
            const storedUserData = sessionStorage.getItem('tempUser_' + userData.id);
            
            if (storedUserData) {
              const currentData = JSON.parse(storedUserData);
              
              // Update with new data, preserving existing picture
              const updatedData = {
                ...currentData,
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                gender: formData.gender,
                birthdate: formData.birthDate,
                phone_num: formData.phoneNumber,
                address: formData.address,
                role: formData.role
              };
              
              // Save back to sessionStorage
              sessionStorage.setItem('tempUser_' + userData.id, JSON.stringify(updatedData));
              
              console.log('Updated user in sessionStorage with new data');
              
              // Call the onSave handler with the updated user data
              onSave({
                ...formData,
                picture: userData.picture
              });
              return;
            } else {
              setApiError('Error: Could not find user data in session storage');
              return;
            }
          } catch (err) {
            console.error('Error updating user in sessionStorage:', err);
            setApiError('Error updating user data');
            return;
          }
        }
        
        // For regular IDs, try multiple approaches to update via the API
        try {
          // Try a POST request first (most commonly supported)
          const response = await axios.put(
            `http://127.0.0.1:8000/api/users/update/${userData.id}`,
            requestData,
            { headers }
          );
          
          console.log('User updated:', response.data);
          
          // Call onSave with updated data
          onSave({
            ...formData,
            picture: userData.picture // Keep existing picture
          });
        } catch (err) {
          if (err.response && err.response.status === 405) {
            // Method not allowed, try PATCH
            try {
              const response = await axios.patch(
                `http://127.0.0.1:8000/api/admin/users/${userData.id}`,
                requestData,
                { headers }
              );
              
              console.log('User updated with PATCH:', response.data);
              onSave({
                ...formData,
                picture: userData.picture // Keep existing picture
              });
            } catch (patchErr) {
              // If PATCH fails, try with form method spoofing
              try {
                // Add _method parameter 
                const spoofData = {
                  ...apiData,
                  _method: 'PUT'
                };
                
                const response = await axios.post(
                  `http://127.0.0.1:8000/api/admin/users/${userData.id}`,
                  spoofData,
                  { headers }
                );
                
                console.log('User updated with POST+_method:', response.data);
                onSave({
                  ...formData,
                  picture: userData.picture // Keep existing picture
                });
              } catch (spoofErr) {
                throw spoofErr;
              }
            }
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error('Error updating user:', err);
        
        if (err.response) {
          console.log('Error response:', err.response.data);
          
          if (err.response.status === 422) {
            // Validation errors
            const errorMessage = err.response.data.message || 'Validation error';
            setApiError(errorMessage);
            
            const responseErrors = err.response.data.errors;
            if (responseErrors) {
              // Display the first error for each field
              const errorMessages = Object.keys(responseErrors)
                .map(field => `${field}: ${responseErrors[field][0]}`)
                .join(', ');
              
              setApiError(`${errorMessage}: ${errorMessages}`);
            }
          } else if (err.response.status === 401) {
            setApiError('Authentication failed. Please log in again.');
          } else {
            setApiError(`Error: ${err.response.data.message || 'Failed to update user'}`);
          }
        } else {
          setApiError('Network error. Please check your connection.');
        }
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
                <div className="w-[90px] text-black text-sm">Full name :</div>
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
                    type="text"
                    name="birthDate"
                    placeholder="YYYY-MM-DD"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.type = 'date';
                      setShowDatePicker(true);
                    }}
                    onBlur={(e) => {
                      if (!formData.birthDate) {
                        e.target.type = 'text';
                      }
                      setShowDatePicker(false);
                    }}
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
                <div className="w-[90px] text-black text-sm">Phone :</div>
                <div className="flex-1 relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="0567849321"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
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
                    placeholder="example@esi-sba.dz"
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

              <div className="flex items-center">
                <div className="w-[90px] text-black text-sm">Role :</div>
                <div className="flex-1 relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-teal-500 text-sm pr-8 appearance-none"
                    disabled={isSubmitting}
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
                  {errors.role && <div className="text-red-500 text-xs mt-1">{errors.role}</div>}
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
                    disabled={isSubmitting}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <PenIcon />
                  </div>
                  {errors.address && <div className="text-red-500 text-xs mt-1">{errors.address}</div>}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-500 rounded-lg hover:bg-gray-50 w-[120px]"
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

export default EditUserModal;
