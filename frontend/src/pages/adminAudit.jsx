import { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/admin';

const AdminAudit = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAuditLogs()
      .then(data => setAuditLogs(data))
      .catch(() => setMessage('Failed to load audit logs.'));
  }, []);

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>Audit Log</h1>
        {message && <p className="admin-message">{message}</p>}
      </div>
      <div className="admin-card">
        <ul className="admin-log-list">
          {auditLogs.map(log => (
            <li key={log.id}>
              <div>
                <strong>{log.action}</strong> - {new Date(log.created_at).toLocaleString()}
              </div>
              <div className="admin-log-meta">{log.ip || 'Unknown IP'}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminAudit;
