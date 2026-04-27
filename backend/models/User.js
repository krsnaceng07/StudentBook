const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Please use only letters, numbers and underscores'],
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'email';
    },
    minlength: 6,
  },
  provider: {
    type: String,
    enum: ['email', 'google', 'apple'],
    default: 'email'
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'banned', 'deleted'],
    default: 'active',
  },
  settings: {
    isPrivate: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    showOnlineStatus: { type: Boolean, default: true },
    showMutualConnections: { type: Boolean, default: true },
    allowMessagesFrom: { type: String, enum: ['everyone', 'connections'], default: 'everyone' },
    discoveryFieldFilter: { type: String, default: 'all' }, // 'all' or 'same_field'
    notifications: {
      messages: { type: Boolean, default: true },
      connections: { type: Boolean, default: true },
      posts: { type: Boolean, default: true },
      teamRequests: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true }
    }
  },
  publicKey: {
    type: String,
    default: null,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogoutAt: Date,
}, { 
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  },
  toObject: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!enteredPassword || !this.password) {
    console.error('Bcrypt Error: enteredPassword or this.password is undefined');
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
// Generate a 6-digit numeric OTP
userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  
  // Generate a random 6-digit number securely
  const otp = crypto.randomInt(100000, 1000000).toString();

  // Hash the OTP and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

userSchema.index({ name: 'text', username: 'text' });

const User = mongoose.model('User', userSchema);
module.exports = User;
