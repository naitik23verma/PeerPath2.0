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
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  console.log('=== USER MODEL PRE-SAVE HOOK ===');
  console.log('Is password modified?', this.isModified('password'));
  console.log('User data before save:', {
    _id: this._id,
    name: this.name,
    email: this.email,
    expertiseLevel: this.expertiseLevel
  });
  
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hashing');
    return next();
  }
  
  try {
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
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