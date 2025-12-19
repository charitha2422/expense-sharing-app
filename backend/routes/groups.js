const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'Name and memberIds (array) are required' });
    }

    if (memberIds.length < 2) {
      return res.status(400).json({ error: 'Group must have at least 2 members' });
    }

    // Verify all users exist
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return res.status(400).json({ error: 'One or more users not found' });
    }

    // Remove duplicates
    const uniqueMemberIds = [...new Set(memberIds.map(id => id.toString()))];

    const group = new Group({
      name,
      description: description || '',
      members: uniqueMemberIds
    });

    await group.save();
    await group.populate('members', 'name email');

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json({ groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .select('-__v');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json({ group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add members to a group
router.post('/:id/members', async (req, res) => {
  try {
    const { memberIds } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: 'memberIds (array) is required' });
    }

    // Verify all users exist
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      return res.status(400).json({ error: 'One or more users not found' });
    }

    // Add new members (avoid duplicates)
    const existingMemberIds = group.members.map(id => id.toString());
    const newMemberIds = memberIds
      .map(id => id.toString())
      .filter(id => !existingMemberIds.includes(id));

    group.members.push(...newMemberIds);
    await group.save();
    await group.populate('members', 'name email');

    res.json({
      message: 'Members added successfully',
      group
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


