# GitHub Setup Guide

Follow these steps to push your project to GitHub:

## Step 1: Create a GitHub Repository

1. Go to https://github.com and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name your repository (e.g., "expense-sharing-app")
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have files)
6. Click "Create repository"

## Step 2: Add Files to Git

Run these commands in your terminal:

```bash
cd d:\CREDRESOLVE

# Add all files (except those in .gitignore)
git add .

# Check what will be committed
git status
```

## Step 3: Make Your First Commit

```bash
git commit -m "Initial commit: Expense Sharing App with React frontend and Node.js backend"
```

## Step 4: Connect to GitHub Repository

After creating the repo on GitHub, you'll see instructions. Use these commands:

```bash
# Add the remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# Verify the remote was added
git remote -v
```

## Step 5: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin master

# Or if your default branch is 'main':
# git push -u origin main
```

## Step 6: Verify

Go to your GitHub repository page and verify all files are uploaded.

## Important Notes

- ✅ `.env` files are ignored (they contain sensitive MongoDB credentials)
- ✅ `node_modules/` folders are ignored (they're large and can be reinstalled)
- ✅ Only source code and configuration files are committed

## Future Updates

After making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

