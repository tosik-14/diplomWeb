const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { uploadFile, getFilesBySection, deleteFile, renameFile, downloadFile, downloadArchiveFile } = require('../controllers/fileController');
const upload = require('../middleware/upload');

router.get('/file', authenticateToken, getFilesBySection);

router.post('/file', authenticateToken, upload.single('file'), uploadFile);

router.delete('/file', authenticateToken, deleteFile); //удалить файлы не в папке

router.put('/file', authenticateToken, renameFile);

router.get('/file/download', authenticateToken, downloadFile); // скачать 1 файл

router.post('/file/download-archive', authenticateToken, downloadArchiveFile); //скачать больше 1 файла архивом


module.exports = router;