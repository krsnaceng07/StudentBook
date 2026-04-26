const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  requestJoinTeam,
  cancelJoinRequest,
  handleJoinRequest,
  getTeamRequests,
  manageTeamMember,
  leaveTeam,
  updateTeamLinks,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

router.post('/', protect, createTeam);
router.get('/', protect, getTeams);
router.get('/:id', protect, validateObjectId('id'), getTeamById);
router.put('/:id', protect, validateObjectId('id'), updateTeam);
router.delete('/:id', protect, validateObjectId('id'), deleteTeam);
router.post('/:teamId/request', protect, validateObjectId('teamId'), requestJoinTeam);
router.delete('/:teamId/request', protect, validateObjectId('teamId'), cancelJoinRequest);
router.get('/:teamId/requests', protect, validateObjectId('teamId'), getTeamRequests);
router.put('/request/:requestId', protect, validateObjectId('requestId'), handleJoinRequest);

// Advanced Management
router.put('/:id/members/:userId', protect, validateObjectId('id'), validateObjectId('userId'), manageTeamMember);
router.put('/:id/links', protect, validateObjectId('id'), updateTeamLinks);
router.post('/:id/leave', protect, validateObjectId('id'), leaveTeam);

module.exports = router;
