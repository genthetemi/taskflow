import { useEffect, useState } from 'react';
import {
  createAdminUser,
  fetchAdminUsers,
  updateUserDetails,
  deleteUser,
  revokeSessions
} from '../services/admin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  const loadUsers = async () => {
    const data = await fetchAdminUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers().catch(() => setMessage('Failed to load users.'));
  }, []);

  const handleRevokeSessions = async (id) => {
    try {
      await revokeSessions(id);
      setMessage('Sessions revoked for the selected user.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to revoke sessions.';
      setMessage(msg);
    }
  };

  const handleDeleteUser = async (id, email) => {
    const ok = window.confirm(`Delete user ${email}? This cannot be undone.`);
    if (!ok) return;

    try {
      await deleteUser(id);
      await loadUsers();
      setMessage('User deleted successfully.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to delete user.';
      setMessage(msg);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
    setShowEdit(true);
  };

  const openAdd = () => {
    setAddForm({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'user',
      status: 'active'
    });
    setShowAdd(true);
  };

  const closeEdit = () => {
    setShowEdit(false);
    setEditingUser(null);
  };

  const closeAdd = () => {
    setShowAdd(false);
  };

  const handleEditSave = async (event) => {
    event.preventDefault();
    if (!editingUser) return;

    const email = String(editForm.email || '').trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setMessage('Please enter a valid email.');
      return;
    }

    if (!String(editForm.first_name || '').trim() || !String(editForm.last_name || '').trim()) {
      setMessage('First and last name are required.');
      return;
    }

    try {
      await updateUserDetails(editingUser.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email,
        role: editForm.role,
        status: editForm.status
      });
      await loadUsers();
      setMessage('User updated successfully.');
      closeEdit();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update user.';
      setMessage(msg);
    }
  };

  const handleAddSave = async (event) => {
    event.preventDefault();

    const email = String(addForm.email || '').trim();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setMessage('Please enter a valid email.');
      return;
    }

    if (!String(addForm.first_name || '').trim() || !String(addForm.last_name || '').trim()) {
      setMessage('First and last name are required.');
      return;
    }

    if (!String(addForm.password || '').trim() || String(addForm.password || '').length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }

    try {
      await createAdminUser({
        first_name: addForm.first_name.trim(),
        last_name: addForm.last_name.trim(),
        email,
        password: addForm.password,
        role: addForm.role,
        status: addForm.status
      });
      await loadUsers();
      setMessage('User created successfully.');
      closeAdd();
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to create user.';
      setMessage(msg);
    }
  };

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>User & Access Control</h1>
        <div className="admin-inline">
          <button className="btn btn-dark" onClick={openAdd}>Add new user</button>
        </div>
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
                    <span className="badge bg-dark text-uppercase">{role}</span>
                  </td>
                  <td>
                    <span className={`badge ${status === 'disabled' ? 'bg-danger' : 'bg-success'}`}>
                      {status === 'disabled' ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => handleRevokeSessions(user.id)}
                    >
                      Revoke Sessions
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-dark"
                      onClick={() => openEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showEdit && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Edit user</h2>
              <button className="btn btn-sm btn-outline-dark" onClick={closeEdit}>Close</button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="admin-modal-grid">
                <label className="admin-field">
                  <span>First name</span>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(event) => setEditForm(prev => ({ ...prev, first_name: event.target.value }))}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Last name</span>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(event) => setEditForm(prev => ({ ...prev, last_name: event.target.value }))}
                    required
                  />
                </label>
                <label className="admin-field admin-field-full">
                  <span>Email</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm(prev => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Role</span>
                  <select
                    value={editForm.role}
                    onChange={(event) => setEditForm(prev => ({ ...prev, role: event.target.value }))}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Status</span>
                  <select
                    value={editForm.status}
                    onChange={(event) => setEditForm(prev => ({ ...prev, status: event.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline-dark" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="btn btn-dark">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add new user</h2>
              <button className="btn btn-sm btn-outline-dark" onClick={closeAdd}>Close</button>
            </div>
            <form onSubmit={handleAddSave}>
              <div className="admin-modal-grid">
                <label className="admin-field">
                  <span>First name</span>
                  <input
                    type="text"
                    value={addForm.first_name}
                    onChange={(event) => setAddForm(prev => ({ ...prev, first_name: event.target.value }))}
                    required
                  />
                </label>
                <label className="admin-field">
                  <span>Last name</span>
                  <input
                    type="text"
                    value={addForm.last_name}
                    onChange={(event) => setAddForm(prev => ({ ...prev, last_name: event.target.value }))}
                    required
                  />
                </label>
                <label className="admin-field admin-field-full">
                  <span>Email</span>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(event) => setAddForm(prev => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </label>
                <label className="admin-field admin-field-full">
                  <span>Temporary password</span>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(event) => setAddForm(prev => ({ ...prev, password: event.target.value }))}
                    required
                    minLength={8}
                  />
                </label>
                <label className="admin-field">
                  <span>Role</span>
                  <select
                    value={addForm.role}
                    onChange={(event) => setAddForm(prev => ({ ...prev, role: event.target.value }))}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label className="admin-field">
                  <span>Status</span>
                  <select
                    value={addForm.status}
                    onChange={(event) => setAddForm(prev => ({ ...prev, status: event.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </label>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline-dark" onClick={closeAdd}>Cancel</button>
                <button type="submit" className="btn btn-dark">Create user</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
