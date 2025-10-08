"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import UsersTable from "@/components/admin/UsersTable";
import UserDetailsModal from "@/components/admin/UserDetailsModal";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, roleFilter, searchTerm]);

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleUserUpdate = () => {
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        onSelectUser={handleSelectUser}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}
