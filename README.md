# Expense Sharing Application Backend

A backend system for an Expense Sharing Application (like Splitwise) built with Node.js, Express.js, and MongoDB (Mongoose).

## Features

1. **User Management**: Create and manage users
2. **Group Management**: Create groups with multiple users
3. **Expense Management**: Add shared expenses within groups
4. **Split Types**:
   - **Equal Split**: Divide expense equally among all group members
   - **Exact Amount Split**: Specify exact amounts each person owes
   - **Percentage Split**: Split expense by percentage
5. **Balance Tracking**: 
   - Track who owes whom
   - Calculate how much each user owes
   - Calculate how much others owe them
6. **Net Settlement**: Balances are automatically simplified (e.g., if A owes B $10 and B owes A $5, it becomes A owes B $5)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `PORT` if needed (default: 3000)

3. Start MongoDB (if running locally):
```bash
# Make sure MongoDB is running on your system
```

4. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Users

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Groups

- `POST /api/groups` - Create a new group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups/:id/members` - Add members to a group

### Expenses

- `POST /api/expenses` - Create a new expense
- `GET /api/expenses` - Get all expenses (optional: `?groupId=xxx` to filter by group)
- `GET /api/expenses/:id` - Get expense by ID
- `DELETE /api/expenses/:id` - Delete an expense

### Balances

- `GET /api/balances/group/:groupId` - Get balances for a group
- `GET /api/balances/user/:userId` - Get balance summary for a user (optional: `?groupId=xxx` to filter by group)

## MongoDB Schema Design

### User Schema

```javascript
{
  name: String (required) - User's full name for identification
  email: String (required, unique) - Email address used as unique identifier
  createdAt: Date - Timestamp of when user was created
}
```

**Why these fields?**
- `name`: Required to identify and display users
- `email`: Unique identifier for users (no authentication, but email serves as unique key)
- `createdAt`: Useful for sorting and tracking when users joined

### Group Schema

```javascript
{
  name: String (required) - Group name
  description: String (optional) - Description of the group
  members: [ObjectId] (required) - Array of user references, minimum 2 members
  createdAt: Date - Timestamp of when group was created
}
```

**Why these fields?**
- `name`: Required to identify groups
- `description`: Optional context about the group
- `members`: Array of user IDs - required to know who is in the group for expense splitting
- `createdAt`: Useful for sorting and tracking

### Expense Schema

```javascript
{
  description: String (required) - Description of the expense
  amount: Number (required, min: 0.01) - Total amount of the expense
  paidBy: ObjectId (required) - Reference to user who paid
  group: ObjectId (required) - Reference to the group this expense belongs to
  splitType: String (required) - 'equal', 'exact', or 'percentage'
  splits: [{
    user: ObjectId (required) - User who owes this portion
    amount: Number (required) - Amount this user owes
    percentage: Number (optional) - Percentage of total (for percentage splits)
  }]
  createdAt: Date - Timestamp of when expense was created
}
```

**Why these fields?**
- `description`: Identifies what the expense was for
- `amount`: Total expense amount needed for calculations
- `paidBy`: Critical - tracks who actually paid, needed to calculate who owes whom
- `group`: Links expense to a group for organization
- `splitType`: Determines how to interpret the splits array
- `splits`: Array containing who owes what - this is the core of expense splitting
  - `user`: Who owes this portion
  - `amount`: How much they owe (calculated or provided based on splitType)
  - `percentage`: Stored for percentage splits for reference/validation
- `createdAt`: Useful for sorting expenses chronologically

### Balance Schema

```javascript
{
  group: ObjectId (required) - Reference to the group
  fromUser: ObjectId (required) - User who owes money
  toUser: ObjectId (required) - User who is owed money
  amount: Number (required, min: 0) - Net amount owed
  updatedAt: Date - Timestamp of last balance update
}
```

**Why these fields?**
- `group`: Scopes balances within a group (users can be in multiple groups)
- `fromUser`: Identifies the debtor
- `toUser`: Identifies the creditor
- `amount`: Net simplified amount after settlement (only positive values stored)
- `updatedAt`: Tracks when balances were last recalculated
- **Unique Index**: `{ group: 1, fromUser: 1, toUser: 1 }` ensures one balance entry per user pair per group

**Why this schema?**
- This is a denormalized view for performance - balances are recalculated from expenses
- Stores simplified net balances (after net settlement) for quick access
- Only stores positive amounts (if A owes B, we store A→B, not B→A with negative)

## Net Settlement Algorithm

The balance calculation uses a net settlement algorithm:

1. **Calculate Raw Balances**: From all expenses, calculate who paid what and who owes what
2. **Build Net Map**: Create a map of who owes whom (e.g., A owes B $10, B owes A $5)
3. **Simplify**: Cancel out opposite debts
   - If A owes B $10 and B owes A $5 → Result: A owes B $5
   - If amounts are equal → No balance entry
   - Only store positive net amounts

This ensures minimal transactions needed to settle all debts.

## Example API Usage

### 1. Create Users

```bash
POST /api/users
{
  "name": "Alice",
  "email": "alice@example.com"
}

POST /api/users
{
  "name": "Bob",
  "email": "bob@example.com"
}

POST /api/users
{
  "name": "Charlie",
  "email": "charlie@example.com"
}
```

### 2. Create a Group

```bash
POST /api/groups
{
  "name": "Weekend Trip",
  "description": "Expenses from our weekend getaway",
  "memberIds": ["<alice_id>", "<bob_id>", "<charlie_id>"]
}
```

### 3. Add an Expense (Equal Split)

```bash
POST /api/expenses
{
  "description": "Dinner",
  "amount": 90,
  "paidBy": "<alice_id>",
  "groupId": "<group_id>",
  "splitType": "equal"
}
```

This will automatically split $90 equally among 3 members: $30 each.

### 4. Add an Expense (Exact Amount Split)

```bash
POST /api/expenses
{
  "description": "Hotel",
  "amount": 300,
  "paidBy": "<bob_id>",
  "groupId": "<group_id>",
  "splitType": "exact",
  "splits": [
    { "user": "<alice_id>", "amount": 100 },
    { "user": "<bob_id>", "amount": 100 },
    { "user": "<charlie_id>", "amount": 100 }
  ]
}
```

### 5. Add an Expense (Percentage Split)

```bash
POST /api/expenses
{
  "description": "Gas",
  "amount": 60,
  "paidBy": "<charlie_id>",
  "groupId": "<group_id>",
  "splitType": "percentage",
  "splits": [
    { "user": "<alice_id>", "percentage": 50 },
    { "user": "<bob_id>", "percentage": 30 },
    { "user": "<charlie_id>", "percentage": 20 }
  ]
}
```

### 6. Get Balances for a Group

```bash
GET /api/balances/group/<group_id>
```

Response:
```json
{
  "group": {
    "id": "...",
    "name": "Weekend Trip"
  },
  "balances": [
    {
      "fromUser": { "name": "Alice", "email": "alice@example.com" },
      "toUser": { "name": "Bob", "email": "bob@example.com" },
      "amount": 50
    }
  ]
}
```

### 7. Get User Balance Summary

```bash
GET /api/balances/user/<user_id>?groupId=<group_id>
```

Response:
```json
{
  "userId": "...",
  "groupId": "...",
  "owes": [
    {
      "to": { "name": "Bob", "email": "bob@example.com" },
      "amount": 50,
      "group": { "name": "Weekend Trip" }
    }
  ],
  "owed": [],
  "totalOwes": 50,
  "totalOwed": 0,
  "netBalance": -50
}
```

## Project Structure

```
.
├── models/
│   ├── User.js          # User schema
│   ├── Group.js         # Group schema
│   ├── Expense.js       # Expense schema
│   └── Balance.js       # Balance schema
├── routes/
│   ├── users.js         # User endpoints
│   ├── groups.js        # Group endpoints
│   ├── expenses.js      # Expense endpoints
│   └── balances.js      # Balance endpoints
├── services/
│   └── balanceService.js # Balance calculation and net settlement logic
├── server.js            # Express server setup
├── package.json
└── README.md
```

## Notes

- No authentication is implemented (as per requirements)
- Balances are recalculated whenever an expense is created or deleted
- The system supports multiple groups per user
- All amounts are stored with 2 decimal precision
- The balance simplification algorithm ensures minimal transactions for settlement


