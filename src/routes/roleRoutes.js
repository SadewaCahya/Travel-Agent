const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Get user role
router.get('/role', authMiddleware, (req, res) => {
  res.json({ role: req.user.role });
});

module.exports = router;
