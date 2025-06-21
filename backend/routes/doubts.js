const express = require('express');
const { body, validationResult } = require('express-validator');
const Doubt = require('../models/Doubt');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/doubts
// @desc    Create a new doubt
// @access  Private
router.post('/', auth, [
  body('subject').notEmpty().withMessage('Subject is required'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, title, description, priority, tags, attachments } = req.body;

    const doubt = new Doubt({
      author: req.user._id,
      subject,
      title,
      description,
      priority: priority || 'medium',
      tags: tags || [],
      attachments: attachments || []
    });

    await doubt.save();

    // Increment user's doubts asked count
    await req.user.incrementDoubtsAsked();

    // Populate author info
    await doubt.populate('author', 'name profileImage rating bio skills expertiseLevel');

    res.status(201).json({ doubt });
  } catch (error) {
    console.error('Create doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doubts
// @desc    Get all doubts with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      subject,
      status,
      priority,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (subject) filter.subject = subject;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const doubts = await Doubt.find(filter)
      .populate('author', 'name profileImage rating bio skills expertiseLevel subjects')
      .populate('responses.user', 'name profileImage rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Doubt.countDocuments(filter);

    res.json({
      doubts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doubts/trending
// @desc    Get trending doubts (most views, most responses)
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get doubts with most views
    const mostViewed = await Doubt.find({})
      .populate('author', 'name profileImage rating bio skills expertiseLevel')
      .sort({ views: -1 })
      .limit(parseInt(limit));

    // Get doubts with most responses
    const mostResponses = await Doubt.find({})
      .populate('author', 'name profileImage rating bio skills expertiseLevel')
      .sort({ 'responses.length': -1 })
      .limit(parseInt(limit));

    // Get recent doubts
    const recentDoubts = await Doubt.find({})
      .populate('author', 'name profileImage rating bio skills expertiseLevel')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      mostViewed,
      mostResponses,
      recentDoubts
    });
  } catch (error) {
    console.error('Get trending doubts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doubts/:id
// @desc    Get doubt by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('author', 'name profileImage rating bio skills expertiseLevel subjects education university')
      .populate('responses.user', 'name profileImage rating bio skills expertiseLevel')
      .populate('upvotes', 'name')
      .populate('downvotes', 'name');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Increment views if user is authenticated and not the author
    if (req.user && doubt.author._id.toString() !== req.user._id.toString()) {
      doubt.views += 1;
      await doubt.save();
      
      // Add views to author's total
      await doubt.author.addViews(1);
    }

    res.json({ doubt });
  } catch (error) {
    console.error('Get doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/doubts/:id/responses
// @desc    Add response to doubt
// @access  Private
router.post('/:id/responses', auth, [
  body('content').trim().isLength({ min: 5 }).withMessage('Response must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is not responding to their own doubt
    if (doubt.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot respond to your own doubt' });
    }

    await doubt.addResponse(req.user._id, req.body.content);

    // Populate the new response
    await doubt.populate('responses.user', 'name profileImage rating bio skills expertiseLevel');

    res.json({ doubt });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/doubts/:id/responses/:responseId/accept
// @desc    Accept a response
// @access  Private
router.put('/:id/responses/:responseId/accept', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is the author of the doubt
    if (doubt.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await doubt.acceptResponse(req.params.responseId);

    // Find the response user and increment their solved count
    const response = doubt.responses.id(req.params.responseId);
    if (response) {
      const responseUser = await User.findById(response.user);
      if (responseUser) {
        await responseUser.incrementDoubtsSolved();
        await responseUser.checkBadges();
      }
    }

    res.json({ doubt });
  } catch (error) {
    console.error('Accept response error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/doubts/:id/vote
// @desc    Vote on doubt (upvote/downvote)
// @access  Private
router.post('/:id/vote', auth, [
  body('voteType').isIn(['upvote', 'downvote']).withMessage('Invalid vote type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    const { voteType } = req.body;
    const userId = req.user._id;

    // Remove existing votes
    doubt.upvotes = doubt.upvotes.filter(id => id.toString() !== userId.toString());
    doubt.downvotes = doubt.downvotes.filter(id => id.toString() !== userId.toString());

    // Add new vote
    if (voteType === 'upvote') {
      doubt.upvotes.push(userId);
    } else {
      doubt.downvotes.push(userId);
    }

    await doubt.save();

    res.json({ doubt });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/doubts/subjects/list
// @desc    Get list of all subjects
// @access  Public
router.get('/subjects/list', async (req, res) => {
  try {
    const subjects = await Doubt.distinct('subject');
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/doubts/:id
// @desc    Delete doubt
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    // Check if user is the author
    if (doubt.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await doubt.remove();
    res.json({ message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 