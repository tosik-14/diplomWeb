const express = require('express');
const { registerUser, loginUser, deleteUsers } = require('../controllers/authController');
const authenticateToken = require('../middleware/authenticateToken');
const isAdmin = require("../middleware/isAdmin");
const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: 'Access to protected route', user: req.user });
});

router.delete('/delete-users', authenticateToken, isAdmin, deleteUsers);

module.exports = router;