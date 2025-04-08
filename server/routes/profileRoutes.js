const express = require('express');
const { getUserProfile, updateUserProfile, updateProfileImage } = require('../controllers/profileController');
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);

router.put('/profile', authenticateToken, updateUserProfile);

router.post('/upload-avatar', upload.single('avatar'), updateProfileImage);

module.exports = router;
