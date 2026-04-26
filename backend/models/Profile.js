const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  headline: {
    type: String,
    maxlength: 100,
    default: 'Student at University'
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
    default: 'Beginner'
  },
  field: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  interests: {
    type: [String],
    default: [],
  },
  goals: {
    type: [String],
    default: [],
  },
  availability: {
    type: String,
    enum: ['Open for Projects', 'Collaborating', 'Looking for Team', 'Busy'],
    default: 'Open for Projects'
  },
  avatar: {
    type: String,
  }
}, { timestamps: true });

// Indexes for Discovery and Search
profileSchema.index({ field: 1 });
profileSchema.index({ skills: 1 });

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
