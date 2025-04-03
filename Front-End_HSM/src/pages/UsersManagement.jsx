import React, { useState, useEffect } from "react";
import { Search, ChevronDown, Plus } from "lucide-react";
import UserTable from "../components/UserTable";
import { useNavigate } from "react-router-dom";
import AddUserModal from "../components/AddUserModal";
import axios from "axios";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addUserError, setAddUserError] = useState("");
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
      
      console.log('User added response:', response.data);
      
      // Create a new user object with all the required fields
      let newUser = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        birthdate: formData.birthdate,
        phone_num: formData.phone_num,
        address: formData.address,
        role: formData.role_name,
        status: "Activated",
        picture: null
      };
      
      // If the response contains user data, use it; otherwise use our constructed data
      if (response.data && response.data.user) {
        console.log('API response contains user data:', response.data.user);
        // Get the ID from the response
        const userId = response.data.user.id || response.data.user._id;
        console.log('User ID from API:', userId);
        
        // Merge the response data with our form data to ensure we have all fields
        newUser = {
          ...newUser,
          ...response.data.user,
          id: userId // Explicitly set the ID from the API response
        };
      }
      
      // Always ensure the user has an ID
      newUser = ensureUserHasId(newUser);
      
      console.log('Adding new user with ID:', newUser.id);
      
      // Store the user in sessionStorage for persistence
      if (newUser.id) {
        console.log('Storing user in sessionStorage with ID:', newUser.id);
        sessionStorage.setItem('tempUser_' + newUser.id, JSON.stringify(newUser));
      }
      
      // Add the new user to the state
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Reset form and close modal
      setIsAddModalOpen(false);
      setAddUserError("");
      
      // Store the timestamp of the last user change in localStorage
      localStorage.setItem('lastUserChange', Date.now().toString());
      
      // Dispatch custom event to notify other components (like DonutChart) of the user creation
      const userCreatedEvent = new CustomEvent('userCreated', { 
        detail: { 
          userId: newUser.id,
          userType: formData.role_name
        } 
      });
      window.dispatchEvent(userCreatedEvent);
      console.log('Dispatched userCreated event with ID:', newUser.id);
      
      // Display success message
      alert("User created successfully!");
      
    } catch (err) {
      console.error('Error adding user:', err);
      
      // Handle specific API error responses
      if (err.response) {
        console.log('Error response:', err.response.data);
        
        if (err.response.status === 422) {
          // Validation errors
          const errorMessage = err.response.data.message || 'Validation error';
          setAddUserError(errorMessage);
          
          // You can also handle individual field errors here if needed
          const errors = err.response.data.errors;
          if (errors) {
            // Display the first error for each field
            const errorMessages = Object.keys(errors)
              .map(field => `${field}: ${errors[field][0]}`)
              .join(', ');
            
            setAddUserError(`${errorMessage}: ${errorMessages}`);
          }
        } else if (err.response.status === 401) {
          setAddUserError("Unauthorized. Please log in again.");
          setTimeout(() => {
            localStorage.removeItem('token');
            navigate('/login');
          }, 2000);
        } else {
          setAddUserError(`Error: ${err.response.data.message}`);
        }
      } else {
        setAddUserError("An error occurred. Please try again.");
      }
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to delete selected users
  const handleDeleteUsers = async (selectedUsers) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Track successful and failed deletions
      const results = {
        successful: [],
        failed: []
      };
      
      // Process each user one by one
      for (const user of selectedUsers) {
        try {
          // Only attempt to delete users with real backend IDs (not generated ones)
          if (!user.id.toString().startsWith('u_')) {
            // Make DELETE request to the API
            await axios.delete(`http://127.0.0.1:8000/api/admin/users/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            console.log(`Successfully deleted user: ${user.name} (${user.id})`);
            results.successful.push(user);
            
            // Remove from sessionStorage if it exists
            sessionStorage.removeItem('tempUser_' + user.id);
          } else {
            // For users with generated IDs, just remove them from the local state
            console.log(`Removing locally generated user: ${user.name} (${user.id})`);
            results.successful.push(user);
            
            // Remove from sessionStorage
            sessionStorage.removeItem('tempUser_' + user.id);
          }
        } catch (err) {
          console.error(`Failed to delete user ${user.id}:`, err);
          results.failed.push(user);
        }
      }
      
      // Update the users list by removing the successfully deleted users
      setUsers(prevUsers => 
        prevUsers.filter(user => 
          !results.successful.some(deletedUser => deletedUser.id === user.id)
        )
      );
      
      // Store the timestamp of the last user change in localStorage
      localStorage.setItem('lastUserChange', Date.now().toString());
      
      // Dispatch custom event to notify other components (like DonutChart) of the user deletion
      const userDeletedEvent = new CustomEvent('userDeleted', { 
        detail: { 
          userIds: results.successful.map(user => user.id),
          userTypes: results.successful.map(user => user.role || 'unknown')
        } 
      });
      window.dispatchEvent(userDeletedEvent);
      
      // Show success/failure message
      if (results.failed.length === 0) {
        alert(`Successfully deleted ${results.successful.length} user(s).`);
      } else if (results.successful.length === 0) {
        alert(`Failed to delete ${results.failed.length} user(s). Please try again.`);
      } else {
        alert(`Successfully deleted ${results.successful.length} user(s). Failed to delete ${results.failed.length} user(s).`);
      }
      
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
              <option value="Employee">Employees</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Year Filter */}
          <div className="relative">
            <select
              className="appearance-none flex items-center gap-2 px-4 py-2 pr-8 rounded-full bg-white border border-gray-200"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Add User Button */}
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0a8a8a] text-white"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
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