import { useState } from 'react';
import CreateUser from './components/CreateUser';
import CreateGroup from './components/CreateGroup';
import AddExpense from './components/AddExpense';
import ViewBalance from './components/ViewBalance';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('create-user');

  const tabs = [
    { id: 'create-user', label: 'Create User', component: CreateUser },
    { id: 'create-group', label: 'Create Group', component: CreateGroup },
    { id: 'add-expense', label: 'Add Expense', component: AddExpense },
    { id: 'view-balance', label: 'View Balance', component: ViewBalance },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || CreateUser;

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Sharing App</h1>
        <p>Manage expenses and balances with your friends</p>
      </header>

      <nav className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        <ActiveComponent />
      </main>

      <footer className="app-footer">
        <p>Expense Sharing Application - Backend API running on port 3000</p>
      </footer>
    </div>
  );
}

export default App;

