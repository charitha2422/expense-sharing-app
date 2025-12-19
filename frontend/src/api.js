import axios from 'axios';

// Base URL for API - adjust if your backend runs on different port
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API calls
export const userAPI = {
  // Create a new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Get all users
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
};

// Group API calls
export const groupAPI = {
  // Create a new group
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  // Get all groups
  getGroups: async () => {
    const response = await api.get('/groups');
    return response.data;
  },

  // Get group by ID
  getGroupById: async (groupId) => {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  },
};

// Expense API calls
export const expenseAPI = {
  // Create a new expense
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  // Get all expenses (optionally filtered by groupId)
  getExpenses: async (groupId = null) => {
    const url = groupId ? `/expenses?groupId=${groupId}` : '/expenses';
    const response = await api.get(url);
    return response.data;
  },

  // Get expense by ID
  getExpenseById: async (expenseId) => {
    const response = await api.get(`/expenses/${expenseId}`);
    return response.data;
  },
};

// Balance API calls
export const balanceAPI = {
  // Get balance for a user (optionally filtered by groupId)
  getUserBalance: async (userId, groupId = null) => {
    const url = groupId 
      ? `/balances/user/${userId}?groupId=${groupId}`
      : `/balances/user/${userId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get balances for a group
  getGroupBalances: async (groupId) => {
    const response = await api.get(`/balances/group/${groupId}`);
    return response.data;
  },
};

export default api;

