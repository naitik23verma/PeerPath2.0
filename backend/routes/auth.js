const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('expertiseLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid expertise level'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('subjects').optional().isArray().withMessage('Subjects must be an array')
], async (req, res) => {
  try {
    console.log('=== REGISTER ROUTE STARTED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      email, 
      password, 
      profileImage, 
      bio, 
      skills, 
      expertiseLevel,
      subjects, 
      education, 
      university, 
      yearOfStudy, 
      contactInfo 
    } = req.body;

    console.log('Extracted data:', {
      name,
      email,
      password: password ? '[HIDDEN]' : 'undefined',
      profileImage,
      bio,
      skills,
      expertiseLevel,
      subjects,
      education,
      university,
      yearOfStudy,
      contactInfo
    });

    // Check if user already exists
    console.log('Checking if user exists with email:', email);
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', user._id);
      return res.status(400).json({ message: 'User already exists' });
    }
    console.log('User does not exist, proceeding with creation');

    // Create new user
    console.log('Creating new user object...');
    user = new User({
      name,
      email,
      password,
      profileImage: profileImage || '',
      bio: bio || '',
      skills: skills || [],
      expertiseLevel: expertiseLevel || 'beginner',
      subjects: subjects || [],
      education: education || '',
      university: university || '',
      yearOfStudy: yearOfStudy || '',
      contactInfo: contactInfo || {
        phone: '',
        whatsapp: '',
        linkedin: ''
      }
    });

    console.log('User object created:', {
      _id: user._id,
      name: user.name,
      email: user.email,
      expertiseLevel: user.expertiseLevel
    });

    console.log('Attempting to save user to database...');
    await user.save();
    console.log('User saved successfully! User ID:', user._id);

    // Generate token
    console.log('Generating JWT token...');
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    console.log('Sending response with user data...');
    res.status(201).json({
      token,
      user: user.getPublicProfile()
    });
    console.log('=== REGISTER ROUTE COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('=== REGISTER ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.message });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Check if it's a JWT error
    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('=== LOGIN ROUTE STARTED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Check if user exists
    console.log('Searching for user in database...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', user._id, user.name);

    // Check password
    console.log('Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password verification failed');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('Password verified successfully');

    // Update online status
    console.log('Updating user online status...');
    user.isOnline = true;
    user.lastSeen = new Date();
    user.lastActive = new Date();
    await user.save();
    console.log('User online status updated');

    // Generate token
    console.log('Generating JWT token...');
    const token = generateToken(user._id);
    console.log('Token generated successfully');

    console.log('Sending login response...');
    res.json({
      token,
      user: user.getPublicProfile()
    });
    console.log('=== LOGIN ROUTE COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', details: error.message });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid data format' });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate field value' });
    }
    
    // Check if it's a JWT error
    if (error.message.includes('JWT_SECRET')) {
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('expertiseLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid expertise level'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('subjects').optional().isArray().withMessage('Subjects must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, 
      bio, 
      profileImage, 
      skills, 
      expertiseLevel,
      subjects, 
      education, 
      university, 
      yearOfStudy, 
      contactInfo 
    } = req.body;
    
    const updateFields = {};

    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (profileImage) updateFields.profileImage = profileImage;
    if (skills) updateFields.skills = skills;
    if (expertiseLevel) updateFields.expertiseLevel = expertiseLevel;
    if (subjects) updateFields.subjects = subjects;
    if (education !== undefined) updateFields.education = education;
    if (university !== undefined) updateFields.university = university;
    if (yearOfStudy !== undefined) updateFields.yearOfStudy = yearOfStudy;
    if (contactInfo) updateFields.contactInfo = contactInfo;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update online status
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date()
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 