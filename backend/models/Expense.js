const mongoose = require('mongoose');

/**
 * Expense Schema
 * 
 * Fields:
 * - description: Description of the expense (required for identification)
 * - amount: Total amount of the expense (required, must be positive)
 * - paidBy: Reference to user who paid (required to track who paid)
 * - group: Reference to the group this expense belongs to (required for grouping expenses)
 * - splitType: Type of split - 'equal', 'exact', or 'percentage' (required to determine split logic)
 * - splits: Array of split details containing:
 *   - user: Reference to user who owes this portion
 *   - amount: Amount this user owes (required for exact and percentage splits)
 *   - percentage: Percentage of total (required for percentage splits, optional for others)
 * - createdAt: Timestamp of when expense was created (for tracking and sorting)
 */
const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage'],
    required: true
  },
  splits: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Expense', expenseSchema);


