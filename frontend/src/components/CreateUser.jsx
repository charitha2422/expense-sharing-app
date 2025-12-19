import { useState } from 'react';
import { userAPI } from '../api';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

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
      const result = await userAPI.createUser(formData);
      setResponse(result);
      setFormData({ name: '', email: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>Create User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter user name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter user email"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="success">
          <strong>Success!</strong> User created successfully.
          {response.user && (
            <div className="response-details">
              <p><strong>ID:</strong> {response.user._id}</p>
              <p><strong>Name:</strong> {response.user.name}</p>
              <p><strong>Email:</strong> {response.user.email}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateUser;

