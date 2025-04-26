import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultUserPhoto from '../assets/DefaultUserPhoto.jpg';
import EditUserModal from '../../components/EditUserModal';
import axios from 'axios';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(DefaultUserPhoto);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`Fetching user with ID: ${id}`);
        
        if (id === 'undefined' || !id) {
          console.error("Invalid user ID provided:", id);
          setError("Invalid user ID. Please go back and select a valid user.");
          setIsLoading(false);
          return;
        }
        
        // Always check sessionStorage first to get the most recent version including pictures
        const storedUserData = sessionStorage.getItem('tempUser_' + id);
        if (storedUserData) {
          try {
            console.log('Found user data in sessionStorage for ID:', id);
            const userData = JSON.parse(storedUserData);
            
            // Verify that the userData has an ID
            if (!userData.id) {
              console.warn('Stored user data is missing ID property');
              userData.id = id; // Ensure the ID is present
            }
            
            formatAndSetUserData(userData);
            
            // If this is not a generated ID, still fetch from API in the background to ensure fresh data
            if (!id.toString().startsWith('u_')) {
              fetchFromAPI();
            }
            return;
          } catch (err) {
            console.error('Error parsing userData from sessionStorage:', err);
            // If there's an error with sessionStorage data, continue to API fetch
          }
        } else {
          console.log('No stored user data found for ID:', id);
        }
        
        // If not in sessionStorage or error occurred, fetch from API
        if (!id.toString().startsWith('u_')) {
          await fetchFromAPI();
        } else {
          setError("User data not found. Please go back to the users list.");
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Function to fetch user data from API
    const fetchFromAPI = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://127.0.0.1:8000/api/admin/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('API Response:', response);
        
        if (response.data) {
          const userData = response.data;
          
          // Ensure the user data has the correct ID
          const userId = userData.id || userData._id || userData.user_id;
          if (!userId) {
            console.warn('API response missing user ID, using URL ID instead');
            userData.id = id;
          } else if (userId.toString() !== id.toString()) {
            console.warn('API returned different ID than requested', {
              urlId: id,
              apiId: userId
            });
            // Use the API ID as it's more authoritative
            userData.id = userId;
          }
          
          // Format and display the data
          formatAndSetUserData(userData);
          
          // Store the fresh API data in sessionStorage for persistence
          // This ensures the data remains available when navigating back from other pages
          sessionStorage.setItem('tempUser_' + userData.id, JSON.stringify(userData));
          console.log('Stored fresh API data in sessionStorage with ID:', userData.id);
        }
      } catch (err) {
        console.error("API fetch error:", err);
        
        if (err.response && err.response.status === 401) {
          // Unauthorized - token might be invalid
          localStorage.removeItem('token');
          navigate('/login');
        } else if (err.response && err.response.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load user details. Please try again later.");
        }
        throw err;
      }
    };
    
    // Helper function to format and set user data
    const formatAndSetUserData = (userData) => {
      console.log('User data to format:', userData);
      
      // Ensure the user ID is preserved
      const userId = userData.id || userData._id || userData.user_id || id;
      if (!userId) {
        console.warn('User data does not have a valid ID');
      } else {
        console.log('Using user ID:', userId);
      }
      
      let firstName = '';
      let lastName = '';
      
      if (userData.name) {
        const nameParts = userData.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }
      
      const formattedUser = {
        id: userId,
        firstName: firstName,
        lastName: lastName,
        gender: userData.gender || '',
        birthDate: userData.birthdate || '',
        phoneNumber: userData.phone_num || '',
        email: userData.email || '',
        role: userData.role?.name || (typeof userData.role === 'string' ? userData.role : ''),
        address: userData.address || '',
        status: userData.status || 'Activated',
        picture: userData.picture,
        picture_base64: userData.picture_base64 // Preserve any base64 backup image
      };
      
      console.log('Formatted user data:', formattedUser);
      
      // Update sessionStorage with the formatted data to ensure consistency
      if (userId) {
        try {
          // Important: We need to store the complete userData object, not just formatted parts
          sessionStorage.setItem('tempUser_' + userId, JSON.stringify({
            ...userData,
            id: userId // Ensure the ID is explicitly set
          }));
          console.log('Updated user data in sessionStorage with formatted ID');
        } catch (err) {
          console.error('Error updating sessionStorage with formatted user data:', err);
        }
      }
      
      setUser(formattedUser);
      
      // Set profile image with fallback logic
      // First try to use the main picture if available
      if (userData.picture) {
        // Check if the picture is a base64 string (starts with data:image)
        if (typeof userData.picture === 'string' && userData.picture.startsWith('data:image')) {
          console.log('Setting profile image from base64 data in picture field');
          setProfileImage(userData.picture);
        } 
        // Check if it's a URL with http
        else if (typeof userData.picture === 'string' && (userData.picture.startsWith('http') || userData.picture.includes('://'))) {
          console.log('Setting profile image from external URL:', userData.picture);
          setProfileImage(userData.picture);
        }
        // Otherwise assume it's a path relative to the storage directory
        else {
          console.log('Setting profile image from storage path:', userData.picture);
          setProfileImage(`http://127.0.0.1:8000/storage/${userData.picture}`);
        }
      } 
      // If no main picture, check for the backup base64 version
      else if (userData.picture_base64) {
        console.log('Using base64 backup image');
        setProfileImage(userData.picture_base64);
      }
      // Fallback to default if no images found
      else {
        console.log('No profile image available, using default');
        setProfileImage(DefaultUserPhoto);
      }
    };
    
    fetchUserDetails();
  }, [id, navigate]);

  const validateImage = (file) => {
    if (!file) {
      throw new Error('Please select an image file');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file must be an image');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size must be less than 5MB');
    }

    return true;
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    setError(null);

    try {
      validateImage(file);
      setIsLoading(true);

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        setProfileImage(imageData);
        
        // Store the base64 image data right away for immediate persistence
        try {
          // Always save the current image state to ensure persistence
          const userId = id;
          
          // Get existing data to preserve all other fields
          const existingData = sessionStorage.getItem('tempUser_' + userId);
          let userData = {
            id: userId,
            picture: imageData,
            picture_base64: imageData // Keep a backup copy in case the main picture gets lost
          };
          
          if (existingData) {
            try {
              const parsedData = JSON.parse(existingData);
              userData = {
                ...parsedData,
                id: userId,
                picture: imageData,
                picture_base64: imageData
              };
            } catch (error) {
              console.error('Error parsing existing user data:', error);
              // Continue with just the basic user data
            }
          }
          
          // Save the updated data back to sessionStorage
          sessionStorage.setItem('tempUser_' + userId, JSON.stringify(userData));
          console.log('Saved user with image to sessionStorage:', userId);
          
          // Update the user state
          setUser(prev => ({
            ...prev,
            picture: imageData,
            picture_base64: imageData
          }));
        } catch (error) {
          console.error('Error saving image to sessionStorage:', error);
        }
        
        // For generated IDs, we're done - the picture is now in sessionStorage
        if (id.toString().startsWith('u_')) {
          console.log('Profile picture updated in sessionStorage for generated ID user');
          alert('Profile picture updated successfully!');
          setIsLoading(false);
          
          // Store the timestamp of the last user change in localStorage
          localStorage.setItem('lastUserChange', Date.now().toString());
          
          // Dispatch custom event to notify other components (like DonutChart) of the user update
          const userUpdatedEvent = new CustomEvent('userUpdated', { 
            detail: { 
              userId: id,
              userType: user.role || 'student'
            } 
          });
          window.dispatchEvent(userUpdatedEvent);
          console.log('Dispatched userUpdated event for picture change with ID:', id);
          return;
        }

        // For regular users, also try to upload to server
        if (!id.toString().startsWith('u_')) {
          try {
            const responseData = await uploadProfilePicture(file);
            
            // If the response contains picture data, update the user state
            if (responseData && (responseData.picture || responseData.user?.picture)) {
              const picturePath = responseData.picture || responseData.user?.picture;
              
              // Update sessionStorage with the server path too, but preserve the base64 version as backup
              try {
                const existingData = sessionStorage.getItem('tempUser_' + id);
                if (existingData) {
                  const parsedData = JSON.parse(existingData);
                  const updatedData = {
                    ...parsedData,
                    picture: picturePath,
                    picture_base64: imageData // Keep the base64 version as backup
                  };
                  
                  // Update sessionStorage with both versions
                  sessionStorage.setItem('tempUser_' + id, JSON.stringify(updatedData));
                  
                  // Update the user state
                  setUser(prev => ({
                    ...prev,
                    picture: picturePath,
                    picture_base64: imageData
                  }));
                  
                  console.log('Updated user in sessionStorage with server picture path and base64 backup');
                }
              } catch (err) {
                console.error('Error updating sessionStorage after server upload:', err);
              }
              
              console.log('Profile picture uploaded to server successfully');
            } else {
              console.log('Picture upload succeeded but response did not contain picture path');
              // The base64 version is already in sessionStorage, so we're covered
            }
            
            // Show success message
            alert('Profile picture updated successfully!');
            
            // Store the timestamp of the last user change in localStorage
            localStorage.setItem('lastUserChange', Date.now().toString());
            
            // Dispatch custom event to notify other components (like DonutChart) of the user update
            const userUpdatedEvent = new CustomEvent('userUpdated', { 
              detail: { 
                userId: id,
                userType: user.role || 'student'
              } 
            });
            window.dispatchEvent(userUpdatedEvent);
            console.log('Dispatched userUpdated event for picture change with ID:', id);
          } catch (err) {
            console.error('Error uploading profile picture to server:', err);
            setError('Failed to upload profile picture to server. The image will be available for this session but may not persist after logout.');
            
            // We still have the base64 version in sessionStorage, so it will work for this session
          }
        }
        
        setIsLoading(false);
      };
      
      reader.onerror = () => {
        setError('Error reading image file.');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      event.target.value = '';
      setIsLoading(false);
    }
  };

  const handleEditPictureClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  // Function to upload profile picture to server
  const uploadProfilePicture = async (file) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Try multiple endpoints and methods
    const tryUploadMethods = async () => {
      try {
        // Method 1: Try dedicated upload endpoint
        const formData = new FormData();
        formData.append('picture', file);

        const response = await axios.post(
          `http://127.0.0.1:8000/api/admin/users/${id}/picture`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        return response;
      } catch (err) {
        console.log('Method 1 failed, trying Method 2');
        
        try {
          // Method 2: Try PUT with form method spoofing
          const formData = new FormData();
          formData.append('picture', file);
          formData.append('_method', 'PUT');

          const response = await axios.post(
            `http://127.0.0.1:8000/api/admin/users/${id}`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
              }
            }
          );
          return response;
        } catch (err2) {
          console.log('Method 2 failed, trying Method 3');
          
          try {
            // Method 3: Try patch endpoint
            const formData = new FormData();
            formData.append('picture', file);

            const response = await axios.patch(
              `http://127.0.0.1:8000/api/admin/users/${id}`,
              formData,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                  'Content-Type': 'multipart/form-data'
                }
              }
            );
            return response;
          } catch (err3) {
            // If all methods fail, throw the last error
            throw err3;
          }
        }
      }
    };

    const response = await tryUploadMethods();
    console.log('Profile picture upload response:', response);
    
    return response.data;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/users')}
          className="mt-4 px-4 py-2 bg-[#0a8a8a] text-white rounded-md hover:bg-[#086a6a]"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mb-4">
          No user data available. The user might not exist or there's an issue retrieving their information.
        </div>
        <button 
          onClick={() => navigate('/users')}
          className="mt-4 px-4 py-2 bg-[#0a8a8a] text-white rounded-md hover:bg-[#086a6a]"
        >
          Back to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <div className="flex flex-col gap-6">
        {/* Header and Photo Section */}
        <div className="flex gap-12">
          {/* Left side - Photo */}
          <div className="relative">
            <div className="relative w-[128px] h-[128px]">
              <img
                src={profileImage}
                alt="User profile" 
                className={`w-[128px] h-[128px] rounded-full object-cover border-4 border-[#004d4d] ${isLoading ? 'opacity-50' : ''}`}
                onError={(e) => {
                  console.log('User profile image failed to load, trying fallback');
                  
                  // Try the base64 backup image if available
                  if (user && user.picture_base64) {
                    console.log('Using base64 backup image');
                    e.target.src = user.picture_base64;
                    return;
                  }
                  
                  // If no user yet, or no base64 backup, check sessionStorage directly
                  try {
                    const storedData = sessionStorage.getItem('tempUser_' + id);
                    if (storedData) {
                      const userData = JSON.parse(storedData);
                      if (userData.picture_base64) {
                        console.log('Found backup image in sessionStorage');
                        e.target.src = userData.picture_base64;
                        return;
                      }
                    }
                  } catch (err) {
                    console.error('Error checking sessionStorage for backup image:', err);
                  }
                  
                  // Fall back to default photo if all else fails
                  console.log('Using default photo for user');
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
          
          {/* Right side - Title and Description */}
          <div className="flex-1">
            <h2 className="text-[#008080] text-2xl font-semibold">User details :</h2>
            <p className="text-gray-600 mt-2">
              View and manage the details of this user below. To edit their information, click
              the 'Edit' button and make the necessary changes.
            </p>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-8">
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
              <div className="font-medium">{user.firstName || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Last name :</label>
              <div className="font-medium">{user.lastName || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Gender :</label>
              <div className="font-medium">{user.gender || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Birth date :</label>
              <div className="font-medium">{user.birthDate || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Phone number :</label>
              <div className="font-medium">{user.phoneNumber || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Email :</label>
              <div className="font-medium">{user.email || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Role :</label>
              <div className="font-medium">{user.role || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Address :</label>
              <div className="font-medium">{user.address || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Deactivate Button */}
        <button className="w-fit px-6 py-2 text-red-500 border border-red-500 rounded-full hover:bg-red-50 transition-colors">
          Desactivate
        </button>
      </div>

      {isModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
          <div className="z-10">
            <EditUserModal
              userData={user}
              onClose={() => setIsModalOpen(false)}
              onSave={(updatedUser) => {
                // Log the updated user data
                console.log('User successfully updated:', updatedUser);
                setIsModalOpen(false);
                
                // Show success message
                alert("User information updated successfully!");
                
                // Store the timestamp of the last user change in localStorage
                localStorage.setItem('lastUserChange', Date.now().toString());
                
                // Dispatch custom event to notify other components (like DonutChart) of the user update
                const userUpdatedEvent = new CustomEvent('userUpdated', { 
                  detail: { 
                    userId: id,
                    userType: updatedUser.role_name || updatedUser.role
                  } 
                });
                window.dispatchEvent(userUpdatedEvent);
                console.log('Dispatched userUpdated event with ID:', id);
                
                // For users with generated IDs, we need to reload data from sessionStorage
                if (id.toString().startsWith('u_')) {
                  setIsLoading(true);
                  
                  // Get the updated data from sessionStorage
                  const storedUserData = sessionStorage.getItem('tempUser_' + id);
                  if (storedUserData) {
                    try {
                      const userData = JSON.parse(storedUserData);
                      
                      // Make sure the picture is preserved
                      if (!userData.picture && user.picture) {
                        userData.picture = user.picture;
                        console.log('Restored missing picture field');
                      }
                      
                      // Make sure the base64 backup is preserved
                      if (!userData.picture_base64 && user.picture_base64) {
                        userData.picture_base64 = user.picture_base64;
                        console.log('Restored missing base64 backup picture');
                      }
                      
                      // Update the user state with the new data
                      formatAndSetUserData(userData);
                      setIsLoading(false);
                    } catch (err) {
                      console.error('Error parsing updated user data:', err);
                      // If there's an error, just reload the page
                      window.location.reload();
                    }
                  } else {
                    // If we couldn't find the data, reload the page
                    window.location.reload();
                  }
                } else {
                  // For regular users, don't reload the page immediately as it might lose picture data
                  // First ensure we preserve the picture in sessionStorage
                  try {
                    const storedUserData = sessionStorage.getItem('tempUser_' + id);
                    
                    // Merge the updated user data with the existing data
                    const mergedUser = {
                      ...user,                   // Keep existing user data as base
                      ...updatedUser,            // Add updated fields
                      picture: user.picture,     // Preserve the picture
                      picture_base64: user.picture_base64 // Preserve the base64 backup
                    };
                    
                    // Update the user state immediately to show changes
                    setUser(mergedUser);
                    
                    // Update sessionStorage with merged data
                    if (storedUserData) {
                      try {
                        const storedData = JSON.parse(storedUserData);
                        const updatedData = {
                          ...storedData,
                          ...updatedUser,
                          picture: storedData.picture || user.picture,
                          picture_base64: storedData.picture_base64 || user.picture_base64
                        };
                        
                        sessionStorage.setItem('tempUser_' + id, JSON.stringify(updatedData));
                        console.log('Updated user in sessionStorage while preserving picture data');
                      } catch (err) {
                        console.error('Error updating user in sessionStorage:', err);
                        // If there's an error, save the merged user anyway
                        sessionStorage.setItem('tempUser_' + id, JSON.stringify(mergedUser));
                      }
                    } else {
                      // No existing data, just store the merged user
                      sessionStorage.setItem('tempUser_' + id, JSON.stringify(mergedUser));
                    }
                    
                    // Refresh the user from the API in the background
                    // But don't wait for it to complete before showing the updated data
                    fetchFromAPI().catch(err => {
                      console.error('Error refreshing user data from API:', err);
                      // Non-blocking, so we don't need to handle this error specifically
                    });
                  } catch (err) {
                    console.error('Error preserving user data:', err);
                    
                    // If we had an error, just refresh from API
                    setIsLoading(true);
                    fetchFromAPI().finally(() => {
                      setIsLoading(false);
                    });
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;