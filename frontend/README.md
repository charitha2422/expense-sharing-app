# Expense Sharing App - React Frontend

A minimal React frontend for the Expense Sharing Application backend.

## Features

- ✅ Create User
- ✅ Create Group
- ✅ Add Expense (with equal, exact, and percentage splits)
- ✅ View Balance

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3001` (configured in `vite.config.js`).

### 3. Make Sure Backend is Running

The backend should be running on `http://localhost:3000`. If your backend runs on a different port, update `API_BASE_URL` in `src/api.js`.

## Project Structure

```
frontend/
├── src/
│   ├── api.js                 # Centralized Axios API calls
│   ├── App.jsx               # Main app component
│   ├── App.css               # Styles
│   ├── main.jsx              # Entry point
│   └── components/
│       ├── CreateUser.jsx    # Create user component
│       ├── CreateGroup.jsx   # Create group component
│       ├── AddExpense.jsx    # Add expense component
│       └── ViewBalance.jsx   # View balance component
├── index.html                # HTML template
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Usage

1. **Create User**: Enter name and email to create a new user
2. **Create Group**: Enter group name and comma-separated user IDs
3. **Add Expense**: 
   - Select group and payer
   - Choose split type (equal/exact/percentage)
   - For exact/percentage splits, provide JSON split details
4. **View Balance**: Enter user ID (and optional group ID) to see balances

## API Configuration

The API base URL is configured in `src/api.js`. By default, it points to:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

If your backend runs on a different URL, update this constant.

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

