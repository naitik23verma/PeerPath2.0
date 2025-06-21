const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentLocation: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date
  },
  transportMode: {
    type: String,
    enum: ['walking', 'bus', 'train', 'car', 'bike', 'other'],
    default: 'other'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  coordinates: {
    current: {
      lat: Number,
      lng: Number
    },
    destination: {
      lat: Number,
      lng: Number
    }
  },
  companions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  maxCompanions: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  fare: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    splitType: {
      type: String,
      enum: ['equal', 'proportional', 'free'],
      default: 'equal'
    }
  },
  preferences: {
    gender: {
      type: String,
      enum: ['any', 'male', 'female'],
      default: 'any'
    },
    smoking: {
      type: Boolean,
      default: false
    },
    music: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for location-based queries
locationSchema.index({ 
  'coordinates.current': '2dsphere',
  'coordinates.destination': '2dsphere',
  isActive: 1,
  departureTime: 1
});

// Method to find nearby companions
locationSchema.statics.findNearbyCompanions = function(userLocation, maxDistance = 5000) {
  return this.find({
    isActive: true,
    'coordinates.current': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat]
        },
        $maxDistance: maxDistance
      }
    }
  }).populate('user', 'name profileImage rating');
};

// Method to add companion request
locationSchema.methods.addCompanionRequest = function(userId) {
  if (this.companions.length >= this.maxCompanions) {
    throw new Error('Maximum companions reached');
  }
  
  const existingRequest = this.companions.find(c => c.user.toString() === userId);
  if (existingRequest) {
    throw new Error('Request already exists');
  }
  
  this.companions.push({ user: userId });
  return this.save();
};

// Method to respond to companion request
locationSchema.methods.respondToRequest = function(userId, status) {
  const companion = this.companions.find(c => c.user.toString() === userId);
  if (!companion) {
    throw new Error('Request not found');
  }
  
  companion.status = status;
  return this.save();
};

module.exports = mongoose.model('Location', locationSchema); 