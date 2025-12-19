import { useState, useEffect } from 'react';
import { expenseAPI, groupAPI, userAPI } from '../api';

const AddExpense = () => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    groupId: '',
    splitType: 'equal',
    splitDetails: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch groups and users on mount
    const fetchData = async () => {
      try {
        const [groupsResult, usersResult] = await Promise.all([
          groupAPI.getGroups(),
          userAPI.getUsers(),
        ]);
        setGroups(groupsResult.groups || []);
        setUsers(usersResult.users || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
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
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        paidBy: formData.paidBy,
        groupId: formData.groupId,
        splitType: formData.splitType,
      };

      // Parse split details based on split type
      if (formData.splitType === 'exact' || formData.splitType === 'percentage') {
        try {
          expenseData.splits = JSON.parse(formData.splitDetails);
        } catch (parseError) {
          throw new Error('Invalid JSON in split details');
        }
      }

      const result = await expenseAPI.createExpense(expenseData);
      setResponse(result);
      setFormData({
        description: '',
        amount: '',
        paidBy: '',
        groupId: '',
        splitType: 'equal',
        splitDetails: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const getSplitDetailsPlaceholder = () => {
    switch (formData.splitType) {
      case 'exact':
        return '[{"user":"user-id-1","amount":50},{"user":"user-id-2","amount":50}]';
      case 'percentage':
        return '[{"user":"user-id-1","percentage":50},{"user":"user-id-2","percentage":50}]';
      default:
        return '';
    }
  };

  return (
    <div className="component">
      <h2>Add Expense</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="e.g., Dinner, Hotel, Gas"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            placeholder="Enter amount"
          />
        </div>

        <div className="form-group">
          <label htmlFor="groupId">Group:</label>
          <select
            id="groupId"
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
            required
          >
            <option value="">Select a group</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>
                {group.name} ({group.members?.length || 0} members)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="paidBy">Paid By (User ID):</label>
          <select
            id="paidBy"
            name="paidBy"
            value={formData.paidBy}
            onChange={handleChange}
            required
          >
            <option value="">Select a user</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="splitType">Split Type:</label>
          <select
            id="splitType"
            name="splitType"
            value={formData.splitType}
            onChange={handleChange}
            required
          >
            <option value="equal">Equal Split</option>
            <option value="exact">Exact Amount Split</option>
            <option value="percentage">Percentage Split</option>
          </select>
        </div>

        {(formData.splitType === 'exact' || formData.splitType === 'percentage') && (
          <div className="form-group">
            <label htmlFor="splitDetails">Split Details (JSON):</label>
            <textarea
              id="splitDetails"
              name="splitDetails"
              value={formData.splitDetails}
              onChange={handleChange}
              required
              rows="4"
              placeholder={getSplitDetailsPlaceholder()}
            />
            <small>
              {formData.splitType === 'exact' 
                ? 'Format: [{"user":"user-id","amount":50},...]'
                : 'Format: [{"user":"user-id","percentage":50},...]'}
            </small>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Expense'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="success">
          <strong>Success!</strong> Expense created successfully.
          {response.expense && (
            <div className="response-details">
              <p><strong>ID:</strong> {response.expense._id}</p>
              <p><strong>Description:</strong> {response.expense.description}</p>
              <p><strong>Amount:</strong> ${response.expense.amount}</p>
              <p><strong>Paid By:</strong> {response.expense.paidBy?.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddExpense;

