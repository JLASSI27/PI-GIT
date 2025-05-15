const express = require('express');
const router = express.Router();
const quizController = require('../../Controllers/Workshop/quizController');
const isAdmin = require("../../Middlewares/User/isAdmin.middleware");
const isAll = require("../../Middlewares/User/isAll.middleware");
const isUser = require("../../Middlewares/User/isUser.middleware");


router.get('/workshop/:workshopId',isAll, quizController.getQuizzesByWorkshop);
router.post('/submit',isAll, quizController.submitQuiz);
router.post('/', isAdmin, quizController.createQuiz);
router.put('/:workshopId', quizController.updateQuiz);

module.exports = router;