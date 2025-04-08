const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Access to protected route', user: req.user });
});

module.exports = router;