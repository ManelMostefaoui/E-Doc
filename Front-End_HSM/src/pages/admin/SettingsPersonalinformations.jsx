import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultUserPhoto from '../../assets/DefaultUserPhoto.jpg';
import AdminEditUserModal from '../../components/CAdmin/AdminEditUserModal';
import axios from 'axios';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const AdminSettings = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({
    // Default admin values from AdminSeeder
    name: 'Admin',
    email: 'admin@esi-sba.dz',
    gender: 'Male',
    birthdate: '2000-01-01',
    phone_num: '056209318',
    address: 'Sidi belAbess',
    role: { name: 'admin' }
  });

  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(DefaultUserPhoto);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Redirect to login if no token exists
    if (!token) {
     //avigate('/login');
      return;
    }
    
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // First check if we have admin data in sessionStorage
        const adminKey = 'admin_user_data';
        const storedAdminData = sessionStorage.getItem(adminKey);
        
        if (storedAdminData) {
          try {
            console.log('Found admin data in sessionStorage');
            const adminData = JSON.parse(storedAdminData);
            
            // Check if it has minimal required fields
            if (adminData && adminData.email) {
              console.log('Using admin data from sessionStorage');
              setUser(adminData);
              
              // If the admin has a profile picture stored in sessionStorage, use it
              if (adminData.picture) {
                if (typeof adminData.picture === 'string' && adminData.picture.startsWith('data:image')) {
                  console.log('Using admin profile image from sessionStorage (base64)');
                  setProfileImage(adminData.picture);
                } else if (typeof adminData.picture === 'string' && 
                          (adminData.picture.startsWith('http') || adminData.picture.includes('//'))) {
                  console.log('Using admin profile image from sessionStorage (URL)');
                  setProfileImage(adminData.picture);
                } else {
                  console.log('Using admin profile image from storage path');
                  setProfileImage(`http://127.0.0.1:8000/storage/${adminData.picture}`);
                }
              }
              
              // Still fetch from API in the background to ensure fresh data
              fetchFromAPI();
              return;
            }
          } catch (err) {
            console.error('Error parsing admin data from sessionStorage:', err);
            // Continue to API fetch if there's an error with sessionStorage data
          }
        } else {
          console.log('No admin data found in sessionStorage');
        }
        
        // If not in sessionStorage or error occurred, fetch from API
        await fetchFromAPI();
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        
        if (err.response && err.response.status === 401) {
          // Unauthorized - token might be invalid
          localStorage.removeItem('token');
         //avigate('/login');
        } else {
          setError("Failed to load user profile. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Function to fetch from API
    const fetchFromAPI = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('Profile data from API:', response.data);
        
        if (response.data && response.data.data) {
          formatAndSetProfileData(response.data.data);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const validateImage = (file) => {
    if (!file) throw new Error('Please select an image file');
    if (!file.type.startsWith('image/')) throw new Error('Selected file must be an image');
    if (file.size > MAX_FILE_SIZE) throw new Error('Image size must be less than 5MB');
    return true;
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setError(null);
    try {
      validateImage(file);
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setProfileImage(imageData);
        setIsLoading(false);
        
        // Store the image in sessionStorage so it persists
        try {
          const adminKey = 'admin_user_data';
          const existingData = sessionStorage.getItem(adminKey);
          
          if (existingData) {
            try {
              const adminData = JSON.parse(existingData);
              
              // Update with the new image
              const updatedData = {
                ...adminData,
                picture: imageData,
                picture_base64: imageData
              };
              
              // Save back to sessionStorage
              sessionStorage.setItem(adminKey, JSON.stringify(updatedData));
              console.log('Updated admin profile picture in sessionStorage');
              
              // Also update the user state
              setUser({
                ...user,
                picture: imageData,
                picture_base64: imageData
              });
              
              // Dispatch custom event to notify Navbar of the update
              window.dispatchEvent(new CustomEvent('adminProfileUpdated'));
              console.log('Dispatched adminProfileUpdated event');
            } catch (err) {
              console.error('Error updating admin profile picture in sessionStorage:', err);
            }
          } else {
            // If no existing data, create a minimal entry with the picture
            const newData = {
              ...user,
              picture: imageData,
              picture_base64: imageData
            };
            sessionStorage.setItem(adminKey, JSON.stringify(newData));
          }
        } catch (err) {
          console.error('Error saving profile picture to sessionStorage:', err);
        }
        
        // In a real app, you would upload the image to the server here
        // uploadProfileImage(file);
      };
      reader.onerror = () => {
        setError('Error reading image file.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      event.target.value = '';
    }
  };

  const handleEditPictureClick = () => fileInputRef.current?.click();
  
  const handleEditClick = () => setIsModalOpen(true);

  const formatAndSetProfileData = (profileData) => {
    console.log('Profile data to format:', profileData);
    
    // Input validation
    if (!profileData) {
      console.error('No profile data provided to format');
      setError('Invalid profile data received');
      return;
    }

    // Data normalization functions
    const normalizeString = (str) => {
      if (!str) return '';
      return str.trim().replace(/\s+/g, ' ');
    };

    const normalizeEmail = (email) => {
      if (!email) return '';
      return email.trim().toLowerCase();
    };

    const normalizePhoneNumber = (phone) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        console.warn('Phone number does not have 10 digits:', phone);
        return phone; // Return original if not valid
      }
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    };

    const normalizeDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateString);
          return '';
        }
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input type="date"
      } catch (e) {
        console.error('Error formatting date:', e);
        return '';
      }
    };

    try {
      // Use backend field names consistently
      const formattedProfile = {
        name: normalizeString(profileData.name) || '',
        email: normalizeEmail(profileData.email) || '',
        gender: normalizeString(profileData.gender) || '',
        birthdate: normalizeDate(profileData.birthdate || profileData.birthDate) || '',
        phone_num: normalizePhoneNumber(profileData.phone_num || profileData.phoneNumber) || '',
        address: normalizeString(profileData.address) || '',
        role: profileData.role?.name || profileData.role || ''
      };

      // Validate critical fields
      validateCriticalFields(formattedProfile);

      // Store in sessionStorage
      storeProfileData(formattedProfile);

      // Create form data version (for the form inputs)
      const formData = {
        ...formattedProfile,
        birthDate: formattedProfile.birthdate,
        phoneNumber: formattedProfile.phone_num
      };

      // Update state
      setUser(formattedProfile);
      setError(null);

    } catch (error) {
      console.error('Error formatting profile data:', error);
      setError('Error processing profile data: ' + error.message);
    }
  };

  const validateCriticalFields = (profile) => {
    if (!profile.email) {
      throw new Error('Email is required');
    }
    if (!profile.name) {
      throw new Error('Name is required');
    }
    if (!profile.email.endsWith('@esi-sba.dz')) {
      throw new Error('Email must be an @esi-sba.dz email address');
    }
  };

  const storeProfileData = (profileData) => {
    try {
      const adminKey = 'admin_user_data';
      sessionStorage.setItem(adminKey, JSON.stringify(profileData));
      console.log('Successfully stored profile data in sessionStorage');
    } catch (err) {
      console.error('Error storing profile data:', err);
      throw new Error('Failed to store profile data');
    }
  };

  const handleSaveChanges = async (updatedUserData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
       //navigate('/login');
        return;
      }
      
      setIsLoading(true);
      
      // Prepare API data
      const apiData = {
        name: `${updatedUserData.name}`,
        email: updatedUserData.email,
        gender: updatedUserData.gender,
        birthdate: updatedUserData.birthDate || updatedUserData.birthdate,
        phone_num: updatedUserData.phoneNumber || updatedUserData.phone_num,
        address: updatedUserData.address
      };
      
      // Update user profile in the API
      const response = await axios.put('http://127.0.0.1:8000/api/profile/update', apiData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile updated:', response.data);
      
      // Get the current state of the admin data in sessionStorage
      const adminKey = 'admin_user_data';
      try {
        // Ensure we preserve any picture data
        const existingData = sessionStorage.getItem(adminKey);
        let updatedData = {
          ...apiData,
          ...response.data // Include any additional data from the response
        };
        
        if (existingData) {
          try {
            const adminData = JSON.parse(existingData);
            
            // Preserve the picture and any other fields not in the update
            updatedData = {
              ...adminData,
              ...updatedData,
              // Make sure we have both formats of fields for compatibility
              name: `${updatedUserData.name} `,
              birthdate: updatedUserData.birthDate || updatedUserData.birthdate,
              phone_num: updatedUserData.phoneNumber || updatedUserData.phone_num
            };
          } catch (err) {
            console.error('Error merging admin data for session storage:', err);
          }
        }
        
        // Store the updated data
        sessionStorage.setItem(adminKey, JSON.stringify(updatedData));
        console.log('Updated admin data in sessionStorage');
        
        // Dispatch custom event to notify Navbar of the update
        window.dispatchEvent(new CustomEvent('adminProfileUpdated'));
        console.log('Dispatched adminProfileUpdated event for profile update');
      } catch (err) {
        console.error('Error updating admin data in sessionStorage:', err);
      }
      
      // Update the local user state with the new data
      const mergedUserData = {
        ...user,
        ...updatedUserData,
        // Make sure both field formats are updated
        name: `${updatedUserData.firstName} ${updatedUserData.lastName}`,
        birthdate: updatedUserData.birthDate || updatedUserData.birthdate,
        phone_num: updatedUserData.phoneNumber || updatedUserData.phone_num
      };
      
      setUser(mergedUserData);
      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && Object.keys(user).length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="flex gap-12">
        <div className="relative">
          <div className="relative w-[128px] h-[128px]">
            <img 
              src={profileImage}
              alt="User profile" 
              className={`w-[128px] h-[128px] rounded-full object-cover border-4 border-[#004d4d] ${isLoading ? 'opacity-50' : ''}`}
              onError={(e) => {
                console.log('Admin profile image failed to load, trying fallback');
                // Try to get user data from sessionStorage
                try {
                  const adminKey = 'admin_user_data';
                  const storedData = sessionStorage.getItem(adminKey);
                  
                  if (storedData) {
                    const adminData = JSON.parse(storedData);
                    
                    // Check if the adminData has a picture_base64 backup
                    if (adminData.picture_base64) {
                      console.log('Using base64 backup image for admin');
                      e.target.src = adminData.picture_base64;
                      return;
                    }
                  }
                } catch (err) {
                  console.error('Error trying to find backup admin image:', err);
                }
                
                // If we got here, fall back to the default image
                console.log('Using default photo for admin');
                e.target.src = DefaultUserPhoto;
              }}
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-sm min-w-[120px]">
            <button 
              onClick={handleEditPictureClick}
              className="w-full flex items-center justify-center gap-2 px-3 py-2"
            >
              <span className="text-sm text-gray-600">Edit picture</span>
              <svg className="h-3.5 w-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="flex-1">
          <h2 className="text-[#008080] text-2xl font-semibold">Personal informations :</h2>
          <p className="text-gray-600 mt-2">
            View and manage your personal information below. To edit your information, click
            the 'Edit' button and make the necessary changes.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Personal informations :</h3>
          <button 
            onClick={handleEditClick}
            className="flex items-center gap-1.5 bg-white rounded-lg py-1.5 px-3 shadow-[0_2px_8px_rgb(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgb(0,0,0,0.15)] transition-shadow"
          >
            <span className="text-sm text-gray-600">Edit</span>
            <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-gray-600 mb-1">First name :</label>
            <div className="font-medium">{user.firstName || user.name?.split(' ')[0] || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Gender :</label>
            <div className="font-medium">{user.gender || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Birth date :</label>
            <div className="font-medium">{user.birthdate || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Phone number :</label>
            <div className="font-medium">{user.phone_num || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Email :</label>
            <div className="font-medium">{user.email || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Role :</label>
            <div className="font-medium">{user.role?.name || user.role || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Address :</label>
            <div className="font-medium">{user.address || 'N/A'}</div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AdminEditUserModal
          userData={user}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};

export default AdminSettings;
