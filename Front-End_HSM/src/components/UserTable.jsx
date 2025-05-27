import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"

export default function UserTable({ users = [], onUserSelect, onDeleteUsers }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Debug users passed to the component
  useEffect(() => {
    console.log('Users passed to UserTable:', users);
  }, [users]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      // Only select users that have IDs
      setSelectedUsers(users.filter(user => user.id).map(user => user.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (userId) => {
    if (!userId) {
      console.error('Attempted to select user without ID');
      return;
    }

    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleUserRowClick = (user) => {
    console.log('Clicked on user row:', user);

    if (!user.id) {
      console.error('Cannot select user - missing ID:', user);
      return;
    }

    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  const handleActivate = () => {
    const selectedUserObjects = users.filter(user => user.id && selectedUsers.includes(user.id));
    console.log('Activating users:', selectedUserObjects);

    if (onUserSelect && selectedUserObjects.length > 0) {
      onUserSelect(selectedUserObjects);
    }

    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleDeactivate = () => {
    const selectedUserObjects = users.filter(user => user.id && selectedUsers.includes(user.id));
    console.log('Deactivating users:', selectedUserObjects);

    if (onUserSelect && selectedUserObjects.length > 0) {
      onUserSelect(selectedUserObjects);
    }

    setSelectedUsers([]);
    setSelectAll(false);
  };

  const handleDelete = () => {
    if (selectedUsers.length === 0) {
      alert("Please select users to delete first");
      return;
    }

    // Confirm before deletion
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`)) {
      const selectedUserObjects = users.filter(user => user.id && selectedUsers.includes(user.id));
      console.log('Deleting users:', selectedUserObjects);

      if (onDeleteUsers && selectedUserObjects.length > 0) {
        onDeleteUsers(selectedUserObjects);
        setSelectedUsers([]);
        setSelectAll(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-[#0a8a8a] focus:ring-[#0a8a8a]"
                    />
                    <button
                      onClick={handleDelete}
                      disabled={selectedUsers.length === 0}
                      className={`cursor-pointer ${selectedUsers.length > 0 ? 'text-red-500 hover:text-red-700' : 'text-gray-400 cursor-not-allowed'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Full name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id || `no-id-${Math.random().toString(36).substring(2, 9)}`}
                  className={`border-b ${user.id && !selectedUsers.includes(user.id) ? `hover:bg-gray-50` : ""} ${user.id && selectedUsers.includes(user.id) ? "bg-[#b3e6e6]" : ""}`}
                >
                  <td className="px-4 py-3" onClick={(e) => {
                    e.stopPropagation();
                    if (user.id) {
                      handleSelectUser(user.id);
                    }
                  }}>
                    <input
                      type="checkbox"
                      checked={user.id && selectedUsers.includes(user.id)}
                      onChange={() => { }}
                      disabled={!user.id}
                      className={`h-4 w-4 rounded border-gray-300 ${user.id ? "text-[#0a8a8a] focus:ring-[#0a8a8a] cursor-pointer" : "text-gray-300 cursor-not-allowed"}`}
                    />
                  </td>
                  <td
                    className={`px-4 py-3 ${user.id ? "cursor-pointer" : "cursor-not-allowed text-gray-400"}`}
                    onClick={() => user.id && handleUserRowClick(user)}
                  >
                    <span className={user.status === "Activated" ? "text-[#0a8a8a]" : "text-red-500"}>
                      {user.status}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 ${user.id ? "cursor-pointer" : "cursor-not-allowed text-gray-400"}`}
                    onClick={() => user.id && handleUserRowClick(user)}
                  >
                    {user.name || 'No name'}
                  </td>
                  <td
                    className={`px-4 py-3 ${user.id ? "cursor-pointer" : "cursor-not-allowed text-gray-400"}`}
                    onClick={() => user.id && handleUserRowClick(user)}
                  >
                    {user.email || 'No email'}
                  </td>
                  <td
                    className={`px-4 py-3 ${user.id ? "cursor-pointer" : "cursor-not-allowed text-gray-400"}`}
                    onClick={() => user.id && handleUserRowClick(user)}
                  >
                    {user.role?.name
                      ? user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1)
                      : typeof user.role === 'string'
                        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                        : 'Unknown'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleActivate}
          className="px-4 py-2 bg-[#0a8a8a] text-white rounded-md hover:bg-[#086a6a] disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={selectedUsers.length === 0}
        >
          Activate
        </button>
        <button
          onClick={handleDeactivate}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={selectedUsers.length === 0}
        >
          Desactivate
        </button>
      </div>
    </div>
  );
}
