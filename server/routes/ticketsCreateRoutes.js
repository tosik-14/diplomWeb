const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { validateFile, validateFileFromStorage, createTickets } = require('../controllers/ticketsCreateController');
const upload = require('../middleware/upload');
const multiUpload = require('../middleware/multiUpload');

router.post('/validate', authenticateToken, upload.single('file'), validateFile);

router.post('/validate-storage', authenticateToken, validateFileFromStorage);

router.post('/create-tickets', authenticateToken, multiUpload, createTickets);


module.exports = router;