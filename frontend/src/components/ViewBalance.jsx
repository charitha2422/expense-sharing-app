import { useState } from 'react';
import { balanceAPI } from '../api';

const ViewBalance = () => {
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);
    setBalanceData(null);

    try {
      const result = await balanceAPI.getUserBalance(userId, groupId || null);
      setBalanceData(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>View Balance</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">User ID:</label>
          <input
            type="text"
            id="userId"
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="Enter user ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="groupId">Group ID (optional):</label>
          <input
            type="text"
            id="groupId"
            name="groupId"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="Leave empty for all groups"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Balance'}
        </button>
      </form>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {balanceData && (
        <div className="balance-results">
          <h3>Balance Summary</h3>
          
          <div className="balance-summary">
            <div className="summary-item">
              <strong>Total Owed:</strong> ${balanceData.totalOwed?.toFixed(2) || '0.00'}
            </div>
            <div className="summary-item">
              <strong>Total Owes:</strong> ${balanceData.totalOwes?.toFixed(2) || '0.00'}
            </div>
            <div className={`summary-item ${balanceData.netBalance >= 0 ? 'positive' : 'negative'}`}>
              <strong>Net Balance:</strong> ${balanceData.netBalance?.toFixed(2) || '0.00'}
              {balanceData.netBalance > 0 && ' (You are owed)'}
              {balanceData.netBalance < 0 && ' (You owe)'}
              {balanceData.netBalance === 0 && ' (Settled)'}
            </div>
          </div>

          {balanceData.owes && balanceData.owes.length > 0 && (
            <div className="balance-section">
              <h4>You Owe:</h4>
              <ul>
                {balanceData.owes.map((item, index) => (
                  <li key={index}>
                    <strong>{item.to?.name || item.to?._id}</strong>: ${item.amount.toFixed(2)}
                    {item.group && ` (Group: ${item.group.name || item.group._id})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {balanceData.owed && balanceData.owed.length > 0 && (
            <div className="balance-section">
              <h4>You Are Owed:</h4>
              <ul>
                {balanceData.owed.map((item, index) => (
                  <li key={index}>
                    <strong>{item.from?.name || item.from?._id}</strong>: ${item.amount.toFixed(2)}
                    {item.group && ` (Group: ${item.group.name || item.group._id})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(!balanceData.owes || balanceData.owes.length === 0) &&
           (!balanceData.owed || balanceData.owed.length === 0) && (
            <div className="info-box">
              <p>No balances found. All settled!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewBalance;

