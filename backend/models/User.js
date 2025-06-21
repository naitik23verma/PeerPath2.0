const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skills: [{
    type: String
  }],
  expertiseLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  subjects: [{
    type: String
  }],
  education: {
    type: String,
    default: ''
  },
  university: {
    type: String,
    default: ''
  },
  yearOfStudy: {
    type: String,
    default: ''
  },
  contactInfo: {
    phone: {
      type: String,
      default: ''
    },
    whatsapp: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    }
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  // Doubt statistics
  doubtsAsked: {
    type: Number,
    default: 0
  },
  doubtsSolved: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  helpfulResponses: {
    type: Number,
    default: 0
  },
  // Activity tracking
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Achievement badges
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Location and travel
  // location: {
  //   type: {
  //     type: String,
  //     enum: ['Point'],
  //     required: false
  //   },
  //   coordinates: {
  //     type: [Number],
  //     required: false,
  //     validate: {
  //       validator: function(coords) {
  //         if (!coords) return true;
  //         return Array.isArray(coords) && coords.length === 2 && 
  //                typeof coords[0] === 'number' && typeof coords[1] === 'number';
  //       },
  //       message: 'Coordinates must be an array of 2 numbers [longitude, latitude]'
  //     }
  //   }
  // },
  currentAddress: {
    type: String,
    default: ''
  },
  lastLocationUpdate: {
    type: Date
  },
  travelPlans: [{
    destination: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    transportMode: {
      type: String,
      enum: ['car', 'bus', 'train', 'plane', 'walking', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Temporarily comment out geospatial index until we fix the data
// userSchema.index({ location: '2dsphere' }, { 
//   sparse: true,
//   partialFilterExpression: { 'location.coordinates': { $exists: true } }
// });

// Pre-save hook to handle location updates
userSchema.pre('save', async function(next) {
  console.log('=== USER MODEL PRE-SAVE HOOK ===');
  console.log('Is password modified?', this.isModified('password'));
  console.log('Is location modified?', this.isModified('location'));
  console.log('User data before save:', {
    _id: this._id,
    name: this.name,
    email: this.email,
    expertiseLevel: this.expertiseLevel,
    location: this.location
  });
  
  // Handle password hashing
  if (this.isModified('password')) {
    try {
      console.log('Hashing password...');
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log('Password hashed successfully');
    } catch (error) {
      console.error('Password hashing error:', error);
      return next(error);
    }
  }
  
  // Handle location validation
  // if (this.isModified('location')) {
  //   console.log('Location modified, validating...');
  //   if (this.location && this.location.type === 'Point' && !this.location.coordinates) {
  //     console.log('Location has type Point but no coordinates, setting to undefined');
  //     this.location = undefined;
  //   }
  // } else if (this.location && this.location.type === 'Point' && !this.location.coordinates) {
  //   // Also check if location exists but is invalid (even if not modified)
  //   console.log('Location exists but is invalid, setting to undefined');
  //   this.location = undefined;
  // }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without password)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Method to increment doubt statistics
userSchema.methods.incrementDoubtsAsked = function() {
  this.doubtsAsked += 1;
  this.lastActive = new Date();
  return this.save();
};

userSchema.methods.incrementDoubtsSolved = function() {
  this.doubtsSolved += 1;
  this.lastActive = new Date();
  return this.save();
};

userSchema.methods.addViews = function(views) {
  this.totalViews += views;
  return this.save();
};

userSchema.methods.incrementHelpfulResponses = function() {
  this.helpfulResponses += 1;
  return this.save();
};

// Method to check and award badges
userSchema.methods.checkBadges = function() {
  const badges = [];
  
  if (this.doubtsSolved >= 10 && !this.badges.find(b => b.name === 'Helper')) {
    badges.push({
      name: 'Helper',
      description: 'Solved 10+ doubts'
    });
  }
  
  if (this.doubtsSolved >= 50 && !this.badges.find(b => b.name === 'Expert Helper')) {
    badges.push({
      name: 'Expert Helper',
      description: 'Solved 50+ doubts'
    });
  }
  
  if (this.rating >= 4.5 && this.totalReviews >= 10 && !this.badges.find(b => b.name === 'Top Rated')) {
    badges.push({
      name: 'Top Rated',
      description: 'High rating with 10+ reviews'
    });
  }
  
  if (badges.length > 0) {
    this.badges.push(...badges);
    return this.save();
  }
  
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', userSchema); 