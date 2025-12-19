const Balance = require('../models/Balance');
const Expense = require('../models/Expense');
const BalanceSimplificationService = require('./balanceSimplificationService');

/**
 * Calculate balances from expenses and simplify using net settlement
 * 
 * Net Settlement Algorithm:
 * 1. Calculate raw balances (who paid vs who owes)
 * 2. Simplify by canceling out opposite debts
 * 3. Store only the net amounts
 */
class BalanceService {
  /**
   * Recalculate and simplify balances for a group
   */
  static async recalculateBalances(groupId) {
    // Get all expenses for the group
    const expenses = await Expense.find({ group: groupId });

    // Calculate raw balances: user balances map
    // Structure: { userId: { paid: amount, owed: amount } }
    const rawBalances = {};

    expenses.forEach(expense => {
      const paidBy = expense.paidBy.toString();

      // Initialize if not exists
      if (!rawBalances[paidBy]) {
        rawBalances[paidBy] = { paid: 0, owed: 0 };
      }
      rawBalances[paidBy].paid += expense.amount;

      // Process splits
      expense.splits.forEach(split => {
        const userId = split.user.toString();
        if (!rawBalances[userId]) {
          rawBalances[userId] = { paid: 0, owed: 0 };
        }
        rawBalances[userId].owed += split.amount;
      });
    });

    // Calculate net amounts between users
    // Structure: { fromUserId: { toUserId: amount } }
    const netBalances = {};

    expenses.forEach(expense => {
      const paidBy = expense.paidBy.toString();

      expense.splits.forEach(split => {
        const userId = split.user.toString();
        
        // Skip if user paid for themselves
        if (paidBy === userId) return;

        if (!netBalances[userId]) {
          netBalances[userId] = {};
        }
        if (!netBalances[userId][paidBy]) {
          netBalances[userId][paidBy] = 0;
        }
        netBalances[userId][paidBy] += split.amount;
      });
    });

    // Simplify balances using net settlement
    const simplifiedBalances = this.simplifyBalances(netBalances);

    // Delete old balances for this group
    await Balance.deleteMany({ group: groupId });

    // Create new simplified balances
    const balanceDocs = [];
    for (const [fromUserId, toUsers] of Object.entries(simplifiedBalances)) {
      for (const [toUserId, amount] of Object.entries(toUsers)) {
        if (amount > 0) {
          balanceDocs.push({
            group: groupId,
            fromUser: fromUserId,
            toUser: toUserId,
            amount: amount
          });
        }
      }
    }

    if (balanceDocs.length > 0) {
      await Balance.insertMany(balanceDocs);
    }

    return simplifiedBalances;
  }

  /**
   * Simplify balances using advanced net settlement algorithm
   * 
   * This uses a greedy matching algorithm to minimize transactions:
   * 1. Calculates net balance for each person
   * 2. Separates into creditors and debtors
   * 3. Matches debtors with creditors greedily to minimize transactions
   * 
   * Example:
   * Input: A owes B: 100, B owes C: 50
   * Simplified: A owes B: 50, A owes C: 50
   * 
   * This reduces the chain A→B→C to direct payments A→B and A→C
   * 
   * @param {Object} netBalances - Balance map: { fromUserId: { toUserId: amount } }
   * @returns {Object} Simplified balance map with minimum transactions
   */
  static simplifyBalances(netBalances) {
    // Use the advanced simplification service
    return BalanceSimplificationService.simplifyBalances(netBalances);
  }

  /**
   * Get balances for a group (with user details)
   */
  static async getBalances(groupId) {
    const balances = await Balance.find({ group: groupId })
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .select('-__v')
      .sort({ amount: -1 });

    return balances;
  }

  /**
   * Get balance summary for a specific user
   */
  static async getUserBalanceSummary(userId, groupId = null) {
    const query = groupId 
      ? { group: groupId, $or: [{ fromUser: userId }, { toUser: userId }] }
      : { $or: [{ fromUser: userId }, { toUser: userId }] };

    const balances = await Balance.find(query)
      .populate('fromUser', 'name email')
      .populate('toUser', 'name email')
      .populate('group', 'name')
      .select('-__v');

    const owes = []; // Amounts user owes to others
    const owed = []; // Amounts others owe to user
    let totalOwed = 0;
    let totalOwes = 0;

    balances.forEach(balance => {
      if (balance.fromUser._id.toString() === userId.toString()) {
        owes.push({
          to: balance.toUser,
          amount: balance.amount,
          group: balance.group
        });
        totalOwes += balance.amount;
      } else {
        owed.push({
          from: balance.fromUser,
          amount: balance.amount,
          group: balance.group
        });
        totalOwed += balance.amount;
      }
    });

    return {
      owes,
      owed,
      totalOwes,
      totalOwed,
      netBalance: totalOwed - totalOwes
    };
  }
}

module.exports = BalanceService;

