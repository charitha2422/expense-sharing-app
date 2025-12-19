const express = require('express');
const router = express.Router();
const BalanceService = require('../services/balanceService');
const Group = require('../models/Group');

// Get balances for a group
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Recalculate balances to ensure they're up to date
    await BalanceService.recalculateBalances(groupId);

    const balances = await BalanceService.getBalances(groupId);

    res.json({
      group: {
        id: group._id,
        name: group.name
      },
      balances
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get balance summary for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { groupId } = req.query;

    // If groupId provided, recalculate balances for that group first
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
      await BalanceService.recalculateBalances(groupId);
    } else {
      // Recalculate all groups (this might be expensive for large datasets)
      // In production, you might want to recalculate on-demand or use a different strategy
      const groups = await Group.find({ members: userId });
      for (const group of groups) {
        await BalanceService.recalculateBalances(group._id);
      }
    }

    const summary = await BalanceService.getUserBalanceSummary(userId, groupId || null);

    res.json({
      userId,
      groupId: groupId || 'all',
      ...summary
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


