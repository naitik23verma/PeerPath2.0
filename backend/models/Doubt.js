const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const doubtSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  responses: [responseSchema],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  solvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  solvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create text index for search functionality
doubtSchema.index({ title: 'text', description: 'text', subject: 'text' });

// Method to add a response
doubtSchema.methods.addResponse = async function(userId, content) {
  this.responses.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to accept a response
doubtSchema.methods.acceptResponse = async function(responseId) {
  const response = this.responses.id(responseId);
  if (response) {
    response.isAccepted = true;
    response.acceptedAt = new Date();
    this.status = 'resolved';
    this.solvedBy = response.user;
    this.solvedAt = new Date();
    return this.save();
  }
  throw new Error('Response not found');
};

// Method to increment views
doubtSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add upvote
doubtSchema.methods.addUpvote = async function(userId) {
  if (!this.upvotes.includes(userId)) {
    this.upvotes.push(userId);
    // Remove from downvotes if exists
    this.downvotes = this.downvotes.filter(id => id.toString() !== userId.toString());
    return this.save();
  }
  return this;
};

// Method to add downvote
doubtSchema.methods.addDownvote = async function(userId) {
  if (!this.downvotes.includes(userId)) {
    this.downvotes.push(userId);
    // Remove from upvotes if exists
    this.upvotes = this.upvotes.filter(id => id.toString() !== userId.toString());
    return this.save();
  }
  return this;
};

// Virtual for vote count
doubtSchema.virtual('voteCount').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Ensure virtual fields are serialized
doubtSchema.set('toJSON', { virtuals: true });
doubtSchema.set('toObject', { virtuals: true });

const Doubt = mongoose.model('Doubt', doubtSchema);

module.exports = Doubt; 