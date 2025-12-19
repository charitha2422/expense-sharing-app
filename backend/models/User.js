const mongoose = require('mongoose');

/**
 * User Schema
 * 
 * Fields:
 * - name: User's full name (required for identification)
 * - email: Unique email address (required for identification, used as unique identifier)
 * - createdAt: Timestamp of when user was created (for tracking and sorting)
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);


