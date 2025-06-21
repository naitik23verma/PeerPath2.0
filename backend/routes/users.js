const express = require('express');
const User = require('../models/User');
const Doubt = require('../models/Doubt');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      subjects,
      online,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    if (subjects) {
      filter.subjects = { $in: subjects.split(',') };
    }

    if (online === 'true') {
      filter.isOnline = true;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ rating: -1, totalReviews: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID with detailed statistics
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's doubts
    const userDoubts = await Doubt.find({ author: req.params.id })
      .select('title subject views responses status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's responses
    const userResponses = await Doubt.find({
      'responses.user': req.params.id
    })
    .select('title subject responses status createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

    // Calculate monthly statistics for the last 6 months
    const monthlyStats = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const doubtsCount = await Doubt.countDocuments({
        author: req.params.id,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      
      const responsesCount = await Doubt.countDocuments({
        'responses.user': req.params.id,
        'responses.createdAt': { $gte: monthStart, $lte: monthEnd }
      });
      
      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        doubts: doubtsCount,
        responses: responsesCount
      });
    }

    res.json({ 
      user, 
      userDoubts, 
      userResponses, 
      monthlyStats 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/analytics
// @desc    Get detailed analytics for a user
// @access  Public
router.get('/:id/analytics', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Basic statistics
    const totalDoubts = await Doubt.countDocuments({ author: userId });
    const totalResponses = await Doubt.countDocuments({ 'responses.user': userId });
    const totalViews = await Doubt.aggregate([
      { $match: { author: userId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    
    // Subject-wise statistics
    const subjectStats = await Doubt.aggregate([
      { $match: { author: userId } },
      { $group: { 
        _id: '$subject', 
        count: { $sum: 1 },
        totalViews: { $sum: '$views' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Response success rate
    const acceptedResponses = await Doubt.countDocuments({
      'responses.user': userId,
      'responses.isAccepted': true
    });
    
    const successRate = totalResponses > 0 ? (acceptedResponses / totalResponses) * 100 : 0;
    
    // Weekly activity for the last 8 weeks
    const weeklyActivity = [];
    const now = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
      
      const doubtsCount = await Doubt.countDocuments({
        author: userId,
        createdAt: { $gte: weekStart, $lte: weekEnd }
      });
      
      const responsesCount = await Doubt.countDocuments({
        'responses.user': userId,
        'responses.createdAt': { $gte: weekStart, $lte: weekEnd }
      });
      
      weeklyActivity.push({
        week: `Week ${8-i}`,
        doubts: doubtsCount,
        responses: responsesCount
      });
    }
    
    res.json({
      totalDoubts,
      totalResponses,
      totalViews: totalViews[0]?.totalViews || 0,
      subjectStats,
      successRate: Math.round(successRate * 100) / 100,
      weeklyActivity
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search/experts
// @desc    Search for experts in specific subjects
// @access  Public
router.get('/search/experts', async (req, res) => {
  try {
    const { subjects, minRating = 4.0 } = req.query;

    if (!subjects) {
      return res.status(400).json({ message: 'Subjects parameter is required' });
    }

    const subjectArray = subjects.split(',');
    
    const experts = await User.find({
      subjects: { $in: subjectArray },
      rating: { $gte: parseFloat(minRating) },
      totalReviews: { $gte: 1 }
    })
    .select('-password')
    .sort({ rating: -1, totalReviews: -1, doubtsSolved: -1 })
    .limit(20);

    res.json({ experts });
  } catch (error) {
    console.error('Search experts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/review
// @desc    Add review for a user
// @access  Private
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const userToReview = await User.findById(req.params.id);
    if (!userToReview) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is not reviewing themselves
    if (userToReview._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot review yourself' });
    }

    // Update user's rating
    const currentTotal = userToReview.rating * userToReview.totalReviews;
    const newTotal = currentTotal + rating;
    const newCount = userToReview.totalReviews + 1;
    const newRating = newTotal / newCount;

    userToReview.rating = newRating;
    userToReview.totalReviews = newCount;
    await userToReview.save();
    
    // Check for new badges
    await userToReview.checkBadges();

    res.json({ 
      user: userToReview.getPublicProfile(),
      message: 'Review added successfully' 
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/online/list
// @desc    Get list of online users
// @access  Public
router.get('/online/list', async (req, res) => {
  try {
    const onlineUsers = await User.find({ 
      isOnline: true 
    })
    .select('name profileImage rating subjects skills expertiseLevel')
    .sort({ lastSeen: -1 })
    .limit(50);

    res.json({ onlineUsers });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/online-status
// @desc    Update user's online status
// @access  Private
router.put('/online-status', auth, async (req, res) => {
  try {
    const { isOnline } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        isOnline: isOnline,
        lastSeen: new Date(),
        lastActive: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get platform statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const onlineUsers = await User.countDocuments({ isOnline: true });
    const topRatedUsers = await User.find({ rating: { $gte: 4.5 }, totalReviews: { $gte: 5 } })
      .select('name rating totalReviews doubtsSolved')
      .sort({ rating: -1, doubtsSolved: -1 })
      .limit(10);
    
    const topHelpers = await User.find({ doubtsSolved: { $gte: 1 } })
      .select('name doubtsSolved rating')
      .sort({ doubtsSolved: -1, rating: -1 })
      .limit(10);
    
    const totalDoubts = await Doubt.countDocuments();
    const totalResponses = await Doubt.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$responses' } } } }
    ]);

    res.json({
      totalUsers,
      onlineUsers,
      topRatedUsers,
      topHelpers,
      totalDoubts,
      totalResponses: totalResponses[0]?.total || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard of top users
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { category = 'solved', limit = 10 } = req.query;
    
    let sortCriteria = {};
    let title = '';
    
    switch (category) {
      case 'solved':
        sortCriteria = { doubtsSolved: -1, rating: -1 };
        title = 'Top Problem Solvers';
        break;
      case 'rating':
        sortCriteria = { rating: -1, totalReviews: -1 };
        title = 'Top Rated Users';
        break;
      case 'active':
        sortCriteria = { doubtsAsked: -1, lastActive: -1 };
        title = 'Most Active Users';
        break;
      case 'helpful':
        sortCriteria = { helpfulResponses: -1, rating: -1 };
        title = 'Most Helpful Users';
        break;
      default:
        sortCriteria = { doubtsSolved: -1, rating: -1 };
        title = 'Top Problem Solvers';
    }
    
    const leaderboard = await User.find({})
      .select('name profileImage rating doubtsSolved doubtsAsked helpfulResponses totalReviews')
      .sort(sortCriteria)
      .limit(parseInt(limit));

    res.json({
      title,
      category,
      leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 