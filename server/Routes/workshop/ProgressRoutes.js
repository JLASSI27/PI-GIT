const express = require('express');
const router = express.Router();
const progressController = require('../../Controllers/Workshop/progressController');
const isUser = require('../../Middlewares/User/isUser.middleware');

// Routes pour la progression
router.post('/', isUser, progressController.startOrGetProgress);
router.put('/complete-task', isUser, progressController.completeTask);
router.put('/:id/submit', isUser, progressController.submitQuiz);
router.get('/:workshopId/getall', isUser, progressController.getProgress);

module.exports = router;