const express = require('express');
const router = express.Router();
const { 
  sendConnectionRequest, 
  cancelConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  disconnectUser,
  getPendingRequests, 
  getConnections,
  getConnectionStatus 
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.use(protect);

// Get all accepted connections
router.get('/', getConnections);

// Get incoming pending requests
router.get('/pending', getPendingRequests);


// Send a request
router.post('/request/:userId', validateObjectId('userId'), sendConnectionRequest);

// Check status with a specific user
router.get('/status/:userId', validateObjectId('userId'), getConnectionStatus);

// Lifecycle Actions
router.put('/:id/cancel', validateObjectId('id'), cancelConnectionRequest);
router.put('/:id/accept', validateObjectId('id'), acceptConnectionRequest);
router.put('/:id/reject', validateObjectId('id'), rejectConnectionRequest);
router.put('/:id/disconnect', validateObjectId('id'), disconnectUser);

module.exports = router;
