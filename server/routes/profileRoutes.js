const express = require('express');
const { getUserProfile, updateUserProfile, updateProfileImage, getAdminData, updateUserRoles } = require('../controllers/profileController');
const authenticateToken = require('../middleware/authenticateToken'); // проверка авторизации
const upload = require('../middleware/upload');// сделайть папку юзеру и/или добавить уникальный номер файлу
const isAdmin = require('../middleware/isAdmin'); // проверка что админ

const router = express.Router();

router.get('/profile', authenticateToken, getUserProfile);

router.put('/profile', authenticateToken, updateUserProfile);

router.post('/upload-avatar', authenticateToken, upload.single('avatar'), updateProfileImage);

router.get('/admin-data', authenticateToken, isAdmin, getAdminData);

router.put('/update-roles', authenticateToken, isAdmin, updateUserRoles);

module.exports = router;
