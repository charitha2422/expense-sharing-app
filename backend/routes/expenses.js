const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const BalanceService = require('../services/balanceService');
const ExpenseSplitService = require('../services/expenseSplitService');

// Create a new expense
router.post('/', async (req, res) => {
  try {
    const { description, amount, paidBy, groupId, splitType, splits } = req.body;

    // Validation
    if (!description || !amount || !paidBy || !groupId || !splitType) {
      return res.status(400).json({ 
        error: 'description, amount, paidBy, groupId, and splitType are required' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Verify group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify paidBy user exists and is in group
    const payer = await User.findById(paidBy);
    if (!payer) {
      return res.status(404).json({ error: 'Payer user not found' });
    }

    if (!group.members.some(m => m.toString() === paidBy.toString())) {
      return res.status(400).json({ error: 'Payer must be a member of the group' });
    }

    // Validate users in splits are group members (for exact and percentage splits)
    if (splitType === 'exact' || splitType === 'percentage') {
      if (!splits || !Array.isArray(splits)) {
        return res.status(400).json({ error: 'splits array is required for exact and percentage splits' });
      }

      // Validate all users in splits are group members
      const splitUserIds = splits.map(s => s.user.toString());
      const groupMemberIds = group.members.map(m => m.toString());
      
      const invalidUsers = splitUserIds.filter(id => !groupMemberIds.includes(id));
      if (invalidUsers.length > 0) {
        return res.status(400).json({ error: 'All users in splits must be group members' });
      }

      // Verify users exist
      const users = await User.find({ _id: { $in: splits.map(s => s.user) } });
      if (users.length !== splits.length) {
        return res.status(400).json({ error: 'One or more users in splits not found' });
      }
    }

    // Calculate splits using the expense split service
    let processedSplits;
    try {
      if (splitType === 'equal') {
        processedSplits = ExpenseSplitService.calculateEqualSplit(amount, group.members);
      } else if (splitType === 'exact') {
        processedSplits = ExpenseSplitService.calculateExactSplit(amount, splits);
      } else if (splitType === 'percentage') {
        processedSplits = ExpenseSplitService.calculatePercentageSplit(amount, splits);
      } else {
        return res.status(400).json({ error: 'Invalid splitType. Must be: equal, exact, or percentage' });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create expense
    const expense = new Expense({
      description,
      amount: parseFloat(amount.toFixed(2)),
      paidBy,
      group: groupId,
      splitType,
      splits: processedSplits
    });

    await expense.save();
    await expense.populate('paidBy', 'name email');
    await expense.populate('group', 'name');
    await expense.populate('splits.user', 'name email');

    // Recalculate balances
    await BalanceService.recalculateBalances(groupId);

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { groupId } = req.query;
    const query = groupId ? { group: groupId } : {};

    const expenses = await Expense.find(query)
      .populate('paidBy', 'name email')
      .populate('group', 'name')
      .populate('splits.user', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email')
      .populate('group', 'name')
      .populate('splits.user', 'name email')
      .select('-__v');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const groupId = expense.group;
    await expense.deleteOne();

    // Recalculate balances
    await BalanceService.recalculateBalances(groupId);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

