const mongoose = require('mongoose');

/**
 * Group Schema
 * 
 * Fields:
 * - name: Group name (required for identification)
 * - description: Optional description of the group
 * - members: Array of user references (required, at least 2 members for a valid group)
 * - createdAt: Timestamp of when group was created (for tracking and sorting)
 */
const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation: Ensure group has at least 2 members
groupSchema.pre('save', function(next) {
  if (this.members.length < 2) {
    return next(new Error('Group must have at least 2 members'));
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);


