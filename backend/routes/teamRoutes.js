const express = require('express');
const router = express.Router();
const { 
  createTeam, 
  getTeams, 
  getTeamById, 
  requestJoinTeam, 
  handleJoinRequest,
  getTeamRequests
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', protect, createTeam);
router.get('/', protect, getTeams);
router.get('/:id', protect, validateObjectId('id'), getTeamById);
router.post('/:teamId/request', protect, validateObjectId('teamId'), requestJoinTeam);
router.get('/:teamId/requests', protect, validateObjectId('teamId'), getTeamRequests);
router.put('/request/:requestId', protect, validateObjectId('requestId'), handleJoinRequest);

module.exports = router;
