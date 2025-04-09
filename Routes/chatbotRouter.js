
const express = require('express');
const { chatWithBot } = require('../Controllers/blog/chatbotController');
const router = express.Router();

router.post('/ask', chatWithBot);

module.exports = router;
