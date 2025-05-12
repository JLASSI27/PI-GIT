
const express = require('express');
const router = express.Router();
const enrollmentController = require('../../controllers/workshop/enrollmentController');
const isUser=require('../../Middlewares/User/isUser.middleware');
const isAdmin=require('../../Middlewares/User/isAdmin.middleware');
// Vérifie que le contrôleur contient bien les fonctions avant d’ajouter les routes
if (!enrollmentController.register) {
    console.error(' ERREUR: La fonction register est introuvable dans enrollmentController.');
}

router.post('/',isUser, enrollmentController.register);
router.get('/',isAdmin, enrollmentController.getEnrollments);
router.get('/:id',isAdmin, enrollmentController.getEnrollmentById);
router.put('/:id',isAdmin, enrollmentController.updateEnrollmentStatus);
router.delete('/:id',isAdmin, enrollmentController.deleteEnrollment);

module.exports = router;