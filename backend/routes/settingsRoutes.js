const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  changePassword,
  updateEmail,
  deleteAccount
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.put('/password', changePassword);
router.put('/email', updateEmail);
router.delete('/account', deleteAccount);

module.exports = router;
