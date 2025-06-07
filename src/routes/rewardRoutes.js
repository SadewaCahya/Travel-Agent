const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');

// CRUD Reward
router.get('/', rewardController.getAllRewards);
router.get('/:id', rewardController.getRewardById);
router.post('/', rewardController.createReward);
router.put('/:id', rewardController.updateReward);
router.delete('/:id', rewardController.deleteReward);

module.exports = router;