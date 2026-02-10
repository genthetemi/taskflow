import { useEffect, useState } from 'react';
import {
  fetchAdminUsers,
  updateUserRole,
  updateUserStatus,
  forcePasswordReset,
  revokeSessions
} from '../services/admin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    const data = await fetchAdminUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch(() => setMessage('Failed to load users.'));
  }, []);

  const handleRoleChange = async (id, role) => {
    await updateUserRole(id, role);
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, role } : user)));
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    await updateUserStatus(id, nextStatus);
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, status: nextStatus } : user)));
  };

  const handleForceReset = async (id) => {
    await forcePasswordReset(id);
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, force_password_reset: 1 } : user)));
    setMessage('Password reset required on next login.');
  };

  const handleRevokeSessions = async (id) => {
    await revokeSessions(id);
    setMessage('Sessions revoked for the selected user.');
  };

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>User & Access Control</h1>
        {message && <p className="admin-message">{message}</p>}
      </div>
      <div className="table-responsive">
        <table className="table admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Security</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const status = user.status || 'active';
              const role = user.role || 'user';
              return (
                <tr key={user.id}>
                  <td>
                    <div className="admin-user">
                      <span className="admin-user-name">{user.first_name} {user.last_name}</span>
                      <span className="admin-user-email">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <select
                      value={role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      className="form-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${status === 'disabled' ? 'btn-danger' : 'btn-outline-dark'}`}
                      onClick={() => handleStatusToggle(user.id, status)}
                    >
                      {status === 'disabled' ? 'Disabled' : 'Active'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => handleForceReset(user.id)}
                    >
                      Force Reset
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => handleRevokeSessions(user.id)}
                    >
                      Revoke Sessions
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
