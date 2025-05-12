const express = require('express');
const router = express.Router();
const workshopController = require('../../Controllers/Workshop/workshopController');
const isUser = require('../../Middlewares/User/isUser.middleware');
const upload = require('../../Middlewares/multer-config');

// Routes principales
router.get('/', workshopController.getWorkshops);
router.get('/:id', workshopController.getWorkshopById);
router.post('/', upload.single('image'), workshopController.createWorkshop);
router.put('/:id', upload.single('image'), workshopController.updateWorkshop);
router.delete('/:id', workshopController.deleteWorkshop);

// Routes pour les tâches et quiz
router.get('/:id/tasks', isUser, workshopController.getWorkshopTasks);
router.get('/:id/quiz', isUser, workshopController.getWorkshopQuiz);
router.post('/:id/quiz/submit', isUser, workshopController.submitQuiz);

module.exports = router;