const mongoose = require('mongoose');

/**
 * Balance Schema
 * 
 * This schema stores simplified net balances between users within a group.
 * It's used for quick access to "who owes whom" information after net settlement.
 * 
 * Fields:
 * - group: Reference to the group (required to scope balances within a group)
 * - fromUser: User who owes money (required to identify the debtor)
 * - toUser: User who is owed money (required to identify the creditor)
 * - amount: Net amount owed from fromUser to toUser (required, must be positive)
 * - updatedAt: Timestamp of last balance update (for tracking when balances were recalculated)
 * 
 * Note: This is a denormalized view for performance. Balances are recalculated
 * from expenses whenever an expense is added/updated/deleted.
 */
const balanceSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure unique balance entries per user pair in a group
balanceSchema.index({ group: 1, fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('Balance', balanceSchema);


