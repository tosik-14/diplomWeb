const express = require('express');
const { createFolder, getUserFolders, deleteFolder, renameFolder, moveItems } = require('../controllers/folderController');
const authenticateToken = require('../middleware/authenticateToken');
const upload = require('../middleware/upload')

const router = express.Router();

router.get('/folder', authenticateToken, getUserFolders);

router.post('/folder', authenticateToken, createFolder);

router.delete('/folder', authenticateToken, deleteFolder); //удалить папку, папки или папку с папками и файлами

router.put('/folder', authenticateToken, renameFolder);

router.post('/folder/move', authenticateToken, moveItems); //переместить папки, файлы, папки с файлами


module.exports = router;
