import { useState, useEffect } from 'react';
import { groupAPI, userAPI } from '../api';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberIds: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const result = await userAPI.getUsers();
      setUsers(result.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setResponse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Parse comma-separated user IDs
      const memberIds = formData.memberIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

      if (memberIds.length < 2) {
        throw new Error('Group must have at least 2 members');
      }

      const groupData = {
        name: formData.name,
        description: formData.description || '',
        memberIds: memberIds,
      };

      const result = await groupAPI.createGroup(groupData);
      setResponse(result);
      setFormData({ name: '', description: '', memberIds: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>Create Group</h2>
      
      {users.length > 0 && (
        <div className="info-box">
          <strong>Available Users:</strong>
          <ul>
            {users.map(user => (
              <li key={user._id}>
                {user.name} ({user.email}) - <code>{user._id}</code>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Group Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter group name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional):</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter group description"
          />
        </div>

        <div className="form-group">
          <label htmlFor="memberIds">Member IDs (comma-separated):</label>
          <input
            type="text"
            id="memberIds"
            name="memberIds"
            value={formData.memberIds}
            onChange={handleChange}
            required
            placeholder="e.g., user-id-1, user-id-2, user-id-3"
          />
          <small>Enter at least 2 user IDs separated by commas</small>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="success">
          <strong>Success!</strong> Group created successfully.
          {response.group && (
            <div className="response-details">
              <p><strong>ID:</strong> {response.group._id}</p>
              <p><strong>Name:</strong> {response.group.name}</p>
              <p><strong>Members:</strong> {response.group.members?.length || 0}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateGroup;

