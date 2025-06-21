const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  isAccepted: {
    type: Boolean,
    default: false
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
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  responses: [responseSchema],
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  tags: [{
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

// Index for better search performance
doubtSchema.index({ subject: 1, status: 1, createdAt: -1 });
doubtSchema.index({ title: 'text', description: 'text' });

// Virtual for response count
doubtSchema.virtual('responseCount').get(function() {
  return this.responses.length;
});

// Method to add response
doubtSchema.methods.addResponse = function(userId, content) {
  this.responses.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to mark response as accepted
doubtSchema.methods.acceptResponse = function(responseId) {
  const response = this.responses.id(responseId);
  if (response) {
    response.isAccepted = true;
    this.status = 'resolved';
    return this.save();
  }
  throw new Error('Response not found');
};

module.exports = mongoose.model('Doubt', doubtSchema); 