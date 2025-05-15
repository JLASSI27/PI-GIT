const express = require('express');
const router = express.Router();
const progressController = require('../../Controllers/Workshop/progressController');
const isUser = require('../../Middlewares/User/isUser.middleware');

// Routes pour la progression
router.post('/',isUser, progressController.saveProgress);
router.get('/my-progress',isUser, progressController.getMyProgress);

module.exports = router;