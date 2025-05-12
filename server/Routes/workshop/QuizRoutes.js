const express = require('express');
const router = express.Router();
const quizController = require('../../Controllers/Workshop/quizController');
const { validateQuiz } = require('../../Middlewares/workshop/validateQuiz');

// Récupérer un quiz
router.get('/workshop/:workshopId', quizController.getQuiz);

// Créer un quiz
router.post('/', validateQuiz, quizController.createQuiz);

// Mettre à jour un quiz
router.put('/:workshopId', validateQuiz, quizController.updateQuiz);

module.exports = router;