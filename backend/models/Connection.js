const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Avoid duplicate requests (A -> B)
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Optimize query performance for scalability
connectionSchema.index({ status: 1 });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
