import { useEffect, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings, fetchIpRules, addIpRule, deleteIpRule } from '../services/admin';

const AdminSecurity = () => {
  const [settings, setSettings] = useState({
    security: { lockAfterFailed: 5, lockMinutes: 15 }
  });
  const [ipRules, setIpRules] = useState([]);
  const [newRule, setNewRule] = useState({ ip: '', type: 'allow', description: '' });
  const [message, setMessage] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [removingRuleId, setRemovingRuleId] = useState(null);

  const loadData = async () => {
    const [settingsData, rulesData] = await Promise.all([
      fetchAdminSettings(),
      fetchIpRules()
    ]);

    setSettings(prev => ({
      ...prev,
      ...settingsData
    }));
    setIpRules(rulesData);
  };

  useEffect(() => {
    loadData().catch(() => setMessage('Failed to load security settings.'));
  }, []);

  const handleSave = async () => {
    setIsSavingSettings(true);
    setMessage('');
    try {
      const updated = await updateAdminSettings({ security: settings.security });
      setSettings(prev => ({ ...prev, ...updated }));
      setMessage('Security settings updated.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save security settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddIpRule = async (event) => {
    event.preventDefault();
    if (!newRule.ip.trim()) return;
    setIsAddingRule(true);
    setMessage('');
    try {
      await addIpRule(newRule);
      setNewRule({ ip: '', type: 'allow', description: '' });
      const rules = await fetchIpRules();
      setIpRules(rules);
      setMessage('IP rule added.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to add IP rule.');
    } finally {
      setIsAddingRule(false);
    }
  };

  const handleRemoveIpRule = async (id) => {
    setRemovingRuleId(id);
    setMessage('');
    try {
      await deleteIpRule(id);
      setIpRules(prev => prev.filter(rule => rule.id !== id));
      setMessage('IP rule removed.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to remove IP rule.');
    } finally {
      setRemovingRuleId(null);
    }
  };

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>Security</h1>
        {message && <p className="admin-message">{message}</p>}
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Login Security</h3>
          <div className="admin-field">
            <label>Lock after failed logins</label>
            <input
              type="number"
              min="1"
              value={settings.security?.lockAfterFailed || 5}
              onChange={(event) => setSettings({
                ...settings,
                security: { ...settings.security, lockAfterFailed: Number(event.target.value) }
              })}
              disabled={isSavingSettings}
            />
          </div>

          <div className="admin-field">
            <label>Lock duration (minutes)</label>
            <input
              type="number"
              min="1"
              value={settings.security?.lockMinutes || 15}
              onChange={(event) => setSettings({
                ...settings,
                security: { ...settings.security, lockMinutes: Number(event.target.value) }
              })}
              disabled={isSavingSettings}
            />
          </div>
          <button className="btn btn-dark admin-save" onClick={handleSave} disabled={isSavingSettings}>
            {isSavingSettings ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>

        <div className="admin-card">
          <h3>IP Allow / Deny List</h3>
          <form onSubmit={handleAddIpRule} className="admin-inline">
            <input
              type="text"
              placeholder="IP address"
              value={newRule.ip}
              onChange={(event) => setNewRule({ ...newRule, ip: event.target.value })}
              disabled={isAddingRule}
            />
            <select
              value={newRule.type}
              onChange={(event) => setNewRule({ ...newRule, type: event.target.value })}
              disabled={isAddingRule}
            >
              <option value="allow">Allow</option>
              <option value="deny">Deny</option>
            </select>
            <input
              type="text"
              placeholder="Description"
              value={newRule.description}
              onChange={(event) => setNewRule({ ...newRule, description: event.target.value })}
              disabled={isAddingRule}
            />
            <button className="btn btn-sm btn-dark" type="submit" disabled={isAddingRule || !newRule.ip.trim()}>
              {isAddingRule ? 'Adding...' : 'Add'}
            </button>
          </form>
          <ul className="admin-rule-list">
            {ipRules.map(rule => (
              <li key={rule.id}>
                <span>{rule.ip} ({rule.rule_type})</span>
                <button
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => handleRemoveIpRule(rule.id)}
                  disabled={removingRuleId === rule.id}
                >
                  {removingRuleId === rule.id ? 'Removing...' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
