# MongoDB Setup Guide

## Step 1: Create .env File

Create a `.env` file in the root directory (`d:\CREDRESOLVE\.env`) with the following content:

```env
MONGODB_URI=mongodb+srv://ninjaa10003:cherry123@cluster1.v1avka7.mongodb.net/Swiggy?retryWrites=true&w=majority&appName=Cluster1
PORT=3000
```

## Step 2: Verify .env File Location

Make sure the `.env` file is in the same directory as `server.js`:
```
d:\CREDRESOLVE\
├── .env          ← Create this file here
├── server.js
├── package.json
└── ...
```

## Step 3: Install Dependencies (if not done already)

```bash
npm install
```

## Step 4: Start the Server

```bash
npm start
```

or for development with auto-reload:

```bash
npm run dev
```

## Expected Output

When the server starts successfully, you should see:

```
✅ Connected to MongoDB successfully
📊 Database: Swiggy
🚀 Server is running on port 3000
📍 API endpoints available at http://localhost:3000/api
```

## Troubleshooting

### If you see connection errors:

1. **Check your MongoDB URI**: Make sure the connection string is correct
2. **Check network access**: Ensure your IP is whitelisted in MongoDB Atlas
3. **Check credentials**: Verify username and password are correct
4. **Check database name**: The URI points to "Swiggy" database - you can change it to "expense-sharing-app" if preferred

### To change the database name:

Update the MongoDB URI in `.env`:
```env
MONGODB_URI=mongodb+srv://ninjaa10003:cherry123@cluster1.v1avka7.mongodb.net/expense-sharing-app?retryWrites=true&w=majority&appName=Cluster1
```

Note: Just change `Swiggy` to `expense-sharing-app` (or any name you prefer).

## Security Note

⚠️ **Important**: The `.env` file contains sensitive credentials and is already in `.gitignore`. Never commit it to version control!

