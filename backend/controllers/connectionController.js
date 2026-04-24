const Connection = require('../models/Connection');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

// @desc    Send a connection request
// @route   POST /api/v1/connections/request/:userId
const sendConnectionRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const requesterId = req.user._id;

    if (recipientId === requesterId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot send a request to yourself' });
    }

    // Check for existing connection in either direction
    let connection = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (connection) {
      // If already connected, do nothing
      if (connection.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already connected' });
      }
      
      // If pending, check direction
      if (connection.status === 'pending') {
        // If the other person already sent a request to us, auto-accept it!
        if (connection.recipient.toString() === requesterId.toString()) {
          connection.status = 'accepted';
          await connection.save();

          await Notification.create({
            recipient: recipientId,
            sender: requesterId,
            type: 'connection_accepted'
          });

          return res.json({ 
            success: true, 
            message: 'You are now connected!', 
            data: connection,
            autoAccepted: true 
          });
        }
        
        return res.status(400).json({ success: false, message: 'Request already pending' });
      }

      // If rejected or cancelled, we can re-open it
      // Ensure the current requester becomes the 'requester' of the record
      connection.status = 'pending';
      connection.requester = requesterId;
      connection.recipient = recipientId;
      await connection.save();
      
      await Notification.create({
        recipient: recipientId,
        sender: requesterId,
        type: 'connection_request'
      });
      
      return res.json({ success: true, message: 'Connection request sent', data: connection });
    }

    // Create new connection if none exists
    connection = await Connection.create({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await Notification.create({
      recipient: recipientId,
      sender: requesterId,
      type: 'connection_request'
    });

    res.status(201).json({ success: true, message: 'Connection request sent', data: connection });
  } catch (err) {
    console.error('Send Connection Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Cancel a connection request
const cancelConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      { 
        _id: req.params.id, 
        requester: req.user._id,
        status: 'pending'
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!connection) {
      const existing = await Connection.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Connection not found' });
      if (existing.requester.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
      return res.status(400).json({ success: false, message: `Cannot cancel connection with status: ${existing.status}` });
    }

    res.json({ success: true, message: 'Request cancelled', data: connection });
  } catch (err) {
    console.error('Cancel Connection Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Accept a connection request
// @route   PUT /api/v1/connections/:id/accept
const acceptConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id,
        status: 'pending'
      },
      { status: 'accepted' },
      { new: true }
    );

    if (!connection) {
      const existing = await Connection.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Connection not found' });
      if (existing.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the recipient can accept this request' });
      return res.status(400).json({ success: false, message: `Cannot accept connection with status: ${existing.status}` });
    }

    await Notification.create({
      recipient: connection.requester,
      sender: req.user._id,
      type: 'connection_accepted'
    });

    res.json({ success: true, message: 'Connection accepted', data: connection });
  } catch (err) {
    console.error('Accept Connection Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reject a connection request
// @route   PUT /api/v1/connections/:id/reject
const rejectConnectionRequest = async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id,
        status: 'pending'
      },
      { status: 'rejected' },
      { new: true }
    );

    if (!connection) {
      const existing = await Connection.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Connection not found' });
      if (existing.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Only the recipient can reject this request' });
      return res.status(400).json({ success: false, message: `Cannot reject connection with status: ${existing.status}` });
    }

    res.json({ success: true, message: 'Connection rejected', data: connection });
  } catch (err) {
    console.error('Reject Connection Request Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Disconnect (set to cancelled)
// @route   PUT /api/v1/connections/:id/disconnect
const disconnectUser = async (req, res) => {
  try {
    const connection = await Connection.findOneAndUpdate(
      { 
        _id: req.params.id, 
        $or: [
          { requester: req.user._id },
          { recipient: req.user._id }
        ],
        status: 'accepted'
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!connection) {
      const existing = await Connection.findById(req.params.id);
      if (!existing) return res.status(404).json({ success: false, message: 'Connection not found' });
      
      const isParticipant = existing.requester.toString() === req.user._id.toString() || 
                            existing.recipient.toString() === req.user._id.toString();
      if (!isParticipant) return res.status(403).json({ success: false, message: 'Not authorized' });
      
      return res.status(400).json({ success: false, message: `Cannot disconnect connection with status: ${existing.status}` });
    }

    res.json({ success: true, message: 'Disconnected successfully', data: connection });
  } catch (err) {
    console.error('Disconnect User Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get incoming pending requests
// @route   GET /api/v1/connections/pending
const getPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({ 
      recipient: req.user._id, 
      status: 'pending' 
    }).populate('requester', 'name username');

    // Batch-fetch all profiles in ONE query (eliminates N+1)
    const requesterIds = requests.map(r => r.requester._id);
    const profiles = await Profile.find({ userId: { $in: requesterIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const formattedRequests = requests.map((reqst) => {
      const profile = profileMap.get(reqst.requester._id.toString());
      return {
        _id: reqst._id,
        status: reqst.status,
        createdAt: reqst.createdAt,
        user: {
          _id: reqst.requester._id,
          name: reqst.requester.name,
          username: reqst.requester.username,
          avatar: profile?.avatar || null,
          field: profile?.field || 'Student',
          skills: profile?.skills || []
        }
      };
    });

    res.json({ success: true, data: formattedRequests });
  } catch (err) {
    console.error('Get Pending Requests Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// @desc    Get all accepted connections
// @route   GET /api/v1/connections
const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: 'accepted'
    }).populate('requester', 'name username').populate('recipient', 'name username');

    // Batch-fetch all profiles in ONE query (eliminates N+1)
    const otherUsers = connections.map(conn =>
      conn.requester._id.toString() === req.user._id.toString() ? conn.recipient : conn.requester
    );
    const otherUserIds = otherUsers.map(u => u._id);
    const profiles = await Profile.find({ userId: { $in: otherUserIds } });
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const formatted = connections.map((conn) => {
      const otherUser = conn.requester._id.toString() === req.user._id.toString() 
        ? conn.recipient 
        : conn.requester;
      const profile = profileMap.get(otherUser._id.toString());

      return {
        _id: conn._id,
        userId: otherUser._id,
        name: otherUser.name,
        username: otherUser.username,
        avatar: profile?.avatar || null,
        field: profile?.field || 'Student',
        skills: profile?.skills || []
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error('Get Connections Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getConnectionStatus = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user._id;

    const connection = await Connection.findOne({
      $or: [
        { requester: currentUserId, recipient: userId },
        { requester: userId, recipient: currentUserId }
      ]
    });

    res.json({ success: true, data: connection ? connection : { status: 'none' } });
  } catch (err) {
    console.error('Get Connection Status Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { 
  sendConnectionRequest, 
  cancelConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  disconnectUser,
  getPendingRequests,
  getConnections,
  getConnectionStatus 
};
