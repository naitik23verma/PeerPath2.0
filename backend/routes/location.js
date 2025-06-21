const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/location/nearby
// @desc    Get users nearby a location
// @access  Private
router.get('/nearby', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 10, limit = 20 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Find users within the specified radius (in kilometers)
    const nearbyUsers = await User.find({
      _id: { $ne: req.user._id }, // Exclude current user
      isOnline: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    })
    .select('name profileImage rating bio skills expertiseLevel subjects university yearOfStudy location lastSeen')
    .limit(parseInt(limit));

    res.json({ users: nearbyUsers });
  } catch (error) {
    console.error('Get nearby users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/location/update
// @desc    Update user's current location
// @access  Private
router.post('/update', auth, [
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, address } = req.body;

    // Update user's location
    await User.findByIdAndUpdate(req.user._id, {
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      currentAddress: address || '',
      lastLocationUpdate: new Date()
    });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/location/travel-companions
// @desc    Find travel companions going to the same destination
// @access  Private
router.get('/travel-companions', auth, async (req, res) => {
  try {
    const { destination, date, limit = 10 } = req.query;

    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    // Find users going to the same destination
    const companions = await User.find({
      _id: { $ne: req.user._id },
      travelPlans: {
        $elemMatch: {
          destination: { $regex: destination, $options: 'i' },
          date: date ? new Date(date) : { $exists: true }
        }
      }
    })
    .select('name profileImage rating bio skills expertiseLevel subjects university yearOfStudy travelPlans')
    .limit(parseInt(limit));

    res.json({ companions });
  } catch (error) {
    console.error('Find travel companions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/location/travel-plan
// @desc    Add or update travel plan
// @access  Private
router.post('/travel-plan', auth, [
  body('destination').notEmpty().withMessage('Destination is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('transportMode').optional().isIn(['car', 'bus', 'train', 'plane', 'walking', 'other']).withMessage('Invalid transport mode'),
  body('description').optional().isString().withMessage('Description must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { destination, date, transportMode, description } = req.body;

    // Add travel plan to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        travelPlans: {
          destination,
          date: new Date(date),
          transportMode: transportMode || 'other',
          description: description || '',
          createdAt: new Date()
        }
      }
    });

    res.json({ message: 'Travel plan added successfully' });
  } catch (error) {
    console.error('Add travel plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/location/travel-plan/:planId
// @desc    Remove travel plan
// @access  Private
router.delete('/travel-plan/:planId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: {
        travelPlans: { _id: req.params.planId }
      }
    });

    res.json({ message: 'Travel plan removed successfully' });
  } catch (error) {
    console.error('Remove travel plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/location/me
// @desc    Get current user's location and travel plans
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('location currentAddress lastLocationUpdate travelPlans');

    res.json({ 
      location: user.location,
      currentAddress: user.currentAddress,
      lastLocationUpdate: user.lastLocationUpdate,
      travelPlans: user.travelPlans
    });
  } catch (error) {
    console.error('Get user location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 