const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Chat');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/chat/:doubtId/:otherUserId
// @desc    Get chat messages between two users for a specific doubt
// @access  Private
router.get('/:doubtId/:otherUserId', auth, async (req, res) => {
  try {
    console.log('=== GET CHAT MESSAGES ===');
    console.log('Doubt ID:', req.params.doubtId);
    console.log('Other User ID:', req.params.otherUserId);
    console.log('Current User ID:', req.user._id);

    const { doubtId, otherUserId } = req.params;
    const currentUserId = req.user._id;

    // Verify that the doubt exists
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      console.log('Doubt not found');
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Verify that the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      console.log('Other user not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Get messages between the two users for this doubt
    const messages = await Message.find({
      doubtId: doubtId,
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name profileImage')
    .populate('receiver', 'name profileImage')
    .sort({ createdAt: 1 })
    .limit(100); // Limit to last 100 messages

    console.log('Messages found:', messages.length);

    // Mark messages as read if they were sent to current user
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        doubtId: doubtId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/send
// @desc    Send a message
// @access  Private
router.post('/send', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('receiver').isMongoId().withMessage('Invalid receiver ID'),
  body('doubtId').isMongoId().withMessage('Invalid doubt ID')
], async (req, res) => {
  try {
    console.log('=== SEND MESSAGE ===');
    console.log('Request body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, receiver, doubtId } = req.body;
    const sender = req.user._id;

    // Verify that the doubt exists
    const doubt = await Doubt.findById(doubtId);
    if (!doubt) {
      console.log('Doubt not found');
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Verify that the receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      console.log('Receiver not found');
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create new message with names
    const message = new Message({
      sender,
      senderName: req.user.name,
      receiver,
      receiverName: receiverUser.name,
      content: content.trim(),
      doubtId,
      doubtTitle: doubt.title
    });

    console.log('Saving message to database...');
    await message.save();
    console.log('Message saved successfully, ID:', message._id);

    // Populate sender and receiver info
    await message.populate('sender', 'name profileImage');
    await message.populate('receiver', 'name profileImage');

    console.log('Sending response with message data');
    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the receiver can mark a message as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/unread/count
// @desc    Get count of unread messages for current user
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 