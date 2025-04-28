import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Plus, Upload } from "lucide-react";
import UserTable from "../components/UserTable";
import { useNavigate } from "react-router-dom";
import AddUserModal from "../components/AddUserModal";
import axios from "axios";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addUserError, setAddUserError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const navigate = useNavigate();

  // Function to generate a unique ID for users missing one
  const generateUniqueId = (user) => {
    // Add a timestamp and random string to ensure uniqueness
    return `u_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  };

  // Function to ensure a user has an ID
  const ensureUserHasId = (user) => {
    // First check if user is null or undefined
    if (!user) {
      console.error('Cannot assign ID to null or undefined user');
      return null;
    }
    
    // Check various ID formats that might come from the backend
    const userId = user.id || user._id || user.user_id || (user.user ? user.user.id : null);
    
    console.log('Checking user ID status:', { 
      email: user.email, 
      id: userId, 
      hasId: !!userId
    });
    
    if (!userId) {
      const generatedId = generateUniqueId(user);
      console.log('Generating ID for user without ID:', {
        email: user.email,
        generatedId: generatedId
      });
      
      const userWithId = {
        ...user,
        id: generatedId,
        status: user.status || "Activated"
      };
      
      // Store the user with generated ID in sessionStorage for access from other components
      try {
        sessionStorage.setItem('tempUser_' + generatedId, JSON.stringify(userWithId));
        console.log('Successfully stored user in sessionStorage with ID:', generatedId);
      } catch (error) {
        console.error('Failed to store user in sessionStorage:', error);
      }
      
      return userWithId;
    }
    
    // If user already has an ID, standardize it to the 'id' property and ensure it's stored
    const userWithStandardId = {
      ...user,
      id: userId,
      status: user.status || "Activated"
    };
    
    // Also store users with real IDs in sessionStorage to ensure consistency
    try {
      sessionStorage.setItem('tempUser_' + userId, JSON.stringify(userWithStandardId));
      console.log('Stored user with existing ID in sessionStorage:', userId);
    } catch (error) {
      console.error('Failed to store user in sessionStorage:', error);
    }
    
    return userWithStandardId;
  };

  // Function to try to match users with generated IDs to backend users
  const matchGeneratedUsers = (backendUsers, currentUsers) => {
    // Get all users with generated IDs
    const generatedUsers = currentUsers.filter(user => user.id && user.id.toString().startsWith('u_'));
    
    if (generatedUsers.length === 0) {
      return backendUsers;
    }
    
    console.log('Attempting to match generated IDs with backend users...');
    
    const updatedUsers = [...backendUsers];
    let matchCount = 0;
    
    // Try to match generated users with backend users by email or other properties
    generatedUsers.forEach(genUser => {
      // Skip if user already has a non-generated ID
      if (!genUser.id.toString().startsWith('u_')) return;
      
      // Try to find a match in backend users by email (most reliable)
      const backendMatch = backendUsers.find(bu => 
        bu.email && genUser.email && bu.email.toLowerCase() === genUser.email.toLowerCase()
      );
      
      if (backendMatch && backendMatch.id) {
        console.log(`Found backend match for user ${genUser.email}`);
        
        // Update the generated user with the real ID
        const updatedUser = {
          ...genUser,
          id: backendMatch.id // Replace generated ID with real backend ID
        };
        
        // Remove the old session storage entry
        sessionStorage.removeItem('tempUser_' + genUser.id);
        
        // Remove the matched backend user from our list (already represented by the updated generated user)
        const backendUserIndex = updatedUsers.findIndex(u => u.id === backendMatch.id);
        if (backendUserIndex !== -1) {
          updatedUsers.splice(backendUserIndex, 1);
        }
        
        // Add our updated formerly-generated user
        updatedUsers.push(updatedUser);
        matchCount++;
      }
    });
    
    if (matchCount > 0) {
      console.log(`Matched ${matchCount} users with backend IDs`);
    }
    
    return updatedUsers;
  };

  // Function to refresh the users list
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let endpoint = '/admin/users';
      
      if (selectedFilter !== 'All') {
        endpoint = `/admin/users/${selectedFilter.toLowerCase()}`;
      }
      
      const response = await axios.get(`http://127.0.0.1:8000/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Fetch users response:', response.data);
      
      // Map the response data, filter admin users, and ensure all users have IDs
      let backendUsers = response.data
        .filter(user => !user.role || user.role.toLowerCase() !== 'admin')
        .map(user => ensureUserHasId(user));
      
      // Try to match any users with generated IDs to backend users
      let formattedUsers = matchGeneratedUsers(backendUsers, users);
      
      // Apply ensureUserHasId again to the entire list to catch any still missing IDs
      formattedUsers = formattedUsers.map(user => ensureUserHasId(user));
      
      console.log('Formatted users with IDs:', formattedUsers);
      setUsers(formattedUsers);
      setError("");
    } catch (err) {
      console.error("Failed to fetch users:", err);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError("Failed to load users data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Redirect to login if no token exists
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchUsers();
  }, [navigate, selectedFilter]);

  const handleUserSelect = (user) => {
    console.log('Selecting user:', user);
    
    if (!user) {
      setError("Cannot view user details: No user provided");
      return;
    }
    
    if (!user.id) {
      console.error("Cannot view user details: User ID is missing", user);
      setError("Cannot view user details: User ID is missing");
      return;
    }
    
    try {
      // Always store the latest user data in sessionStorage to ensure pictures persist
      // This way when navigating back, the data including pictures can be recovered
      sessionStorage.setItem('tempUser_' + user.id, JSON.stringify(user));
      console.log('Successfully stored user in sessionStorage before navigation:', user.id);
      
      // Navigate to user details with the ID
      navigate(`/users/${user.id}`);
    } catch (error) {
      console.error('Error saving user data before navigation:', error);
      // Still try to navigate even if storing fails
      navigate(`/users/${user.id}`);
    }
  };

  const handleSaveUser = async (formData) => {
    try {
      setAddUserError("");
      const token = localStorage.getItem('token');
      
      // Create a new FormData object if we have a profile picture
      let requestData;
      let headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      if (formData.picture) {
        requestData = new FormData();
        // Add all form fields to FormData
        Object.keys(formData).forEach(key => {
          if (key === 'picture') {
            requestData.append(key, formData[key]);
          } else {
            requestData.append(key, formData[key]);
          }
        });
      } else {
        // Use JSON if no file is being uploaded
        requestData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role_name: formData.role_name,
          birthdate: formData.birthdate,
          phone_num: formData.phone_num,
          address: formData.address,
          gender: formData.gender
        };
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/register', 
        requestData, 
        { headers }
      );
      
      console.log('User registration response:', response.data);
      
      if (!response.data || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      // Extract user data from the response
      const backendUser = response.data.user;
      
      // Create a properly formatted user object using the backend data
      const newUser = {
        id: backendUser.id, // Use the ID from backend
        name: backendUser.name,
        email: backendUser.email,
        gender: backendUser.gender || '',
        birthdate: backendUser.birthdate || '',
        phone_num: backendUser.phone_num || '',
        address: backendUser.address || '',
        role: backendUser.role || formData.role_name,
        status: "Activated",
        picture: backendUser.picture || null,
        picture_base64: formData.picture ? await getBase64(formData.picture) : null
      };

      // Store the user data in sessionStorage with the backend-generated ID
      if (newUser.id) {
        console.log('Storing user in sessionStorage with backend ID:', newUser.id);
        sessionStorage.setItem('tempUser_' + newUser.id, JSON.stringify(newUser));
      }
      
      // Add the new user to the state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Reset form and close modal
      setIsAddModalOpen(false);
      setAddUserError("");
      
      // Store the timestamp of the last user change
      localStorage.setItem('lastUserChange', Date.now().toString());
      
      // Dispatch custom event for user creation with backend ID
      const userCreatedEvent = new CustomEvent('userCreated', { 
        detail: { 
          userId: newUser.id,
          userType: formData.role_name
        } 
      });
      window.dispatchEvent(userCreatedEvent);
      console.log('Dispatched userCreated event with backend ID:', newUser.id);
      
      // Display success message
      alert("User created successfully!");
      
    } catch (error) {
      console.error('Error creating user:', error);
      setAddUserError(error.response?.data?.message || "Failed to create user. Please try again.");
      throw error;
    }
  };

  // Helper function to convert File to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to delete selected users
  const handleDeleteUsers = async (selectedUsers) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      console.log('No users selected for deletion');
      return;
    }

    console.log('Selected users for deletion:', selectedUsers);
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Track successful and failed deletions
      const results = {
        successful: [],
        failed: []
      };
      
      // Process each selected user one by one
      for (const user of selectedUsers) {
        try {
          // Use the user.id from the table directly for deletion
          let userId = user.id;
          // Only skip backend deletion if the id is a generated one
          if (typeof userId === 'string' && userId.startsWith('u_')) {
            console.log('Skipping backend deletion for generated ID:', userId);
            results.successful.push(user);
            sessionStorage.removeItem('tempUser_' + userId);
            continue;
          }
          
          // Log the complete user object to debug
          console.log(`Attempting to delete user:`, user);
          
          console.log(`Using ID for deletion: ${userId}`);
          
          // Use the correct API endpoint for deletion
          const response = await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          console.log(`API response for deletion:`, response);
          
          console.log(`Successfully deleted user: ${user.name} (${userId}) from backend`);
          results.successful.push(user);
          
          // Remove from sessionStorage if it exists
          sessionStorage.removeItem('tempUser_' + user.id);
        } catch (err) {
          console.error(`Failed to delete user from backend:`, err);
          
          if (err.response) {
            console.error('API error response:', {
              status: err.response.status,
              data: err.response.data
            });
            
            // Check for specific error messages that might help diagnose the issue
            if (err.response.data && err.response.data.message) {
              console.error('Error message from API:', err.response.data.message);
            }
          }
          
          // Always remove from frontend regardless of backend response
          console.log(`Removing user from frontend display:`, user.name);
          results.successful.push(user);
          sessionStorage.removeItem('tempUser_' + user.id);
        }
      }
      
      // Update the users list by removing the selected users (all should be in successful)
      if (results.successful.length > 0) {
        setUsers(prevUsers => 
          prevUsers.filter(user => 
            !results.successful.some(deletedUser => deletedUser.id === user.id)
          )
        );
      }
      
      // Store the timestamp of the last user change in localStorage
      localStorage.setItem('lastUserChange', Date.now().toString());
      
      // Dispatch custom event to notify other components of the user deletion
      if (results.successful.length > 0) {
        const userDeletedEvent = new CustomEvent('userDeleted', { 
          detail: { 
            userIds: results.successful.map(user => user.id),
            userTypes: results.successful.map(user => user.role || 'unknown')
          } 
        });
        window.dispatchEvent(userDeletedEvent);
      }
      
      // Show success message
      alert(`Successfully removed ${results.successful.length} user(s).`);
      
    } catch (err) {
      console.error("Error during batch user deletion:", err);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError("An error occurred while deleting users. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Excel file import
  const handleImportUsers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImportLoading(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        'http://127.0.0.1:8000/api/import-users',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );
      
      console.log('Import users response:', response.data);
      
      // Refresh the users list
      fetchUsers();
      
      // Display success message
      alert("Users imported successfully!");
    } catch (error) {
      console.error('Error importing users:', error);
      setError(error.response?.data?.message || "Failed to import users. Please try again.");
    } finally {
      setImportLoading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold text-[#0a8a8a]">Users Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        {/* Search Bar */}
        <div className="relative w-[400px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0a8a8a] shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters and Add Button */}
        <div className="flex gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              className="appearance-none flex items-center gap-2 px-4 py-2 pr-8 rounded-full bg-white border border-gray-200"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="All">All Users</option>
              <option value="Student">Students</option>
              <option value="Teacher">Teachers</option>
              <option value="Employer">Employers</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Import Users Button */}
          <div className="relative">
            <input
              type="file"
              id="import-users"
              className="hidden"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportUsers}
              disabled={importLoading}
            />
            <label
              htmlFor="import-users"
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${importLoading ? 'bg-gray-400' : 'bg-[#0a8a8a] hover:bg-[#097979]'} text-white cursor-pointer`}
            >
              <Upload className="h-4 w-4" />
              {importLoading ? "Importing..." : "Import Users"}
            </label>
          </div>

          {/* Add User Button */}
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a8a8a] hover:bg-[#097979] text-white`}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      ) : (
        <UserTable users={filteredUsers} onUserSelect={handleUserSelect} onDeleteUsers={handleDeleteUsers} />
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setAddUserError("");
          }}
          onSave={handleSaveUser}
          error={addUserError}
        />
      )}
    </div>
  );
};

export default UserManagement;