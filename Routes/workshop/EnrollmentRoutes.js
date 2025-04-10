const express = require('express');
const router = express.Router();
const enrollmentController = require('../../Controllers/./Workshop/enrollmentController');

// Vérifie que le contrôleur contient bien les fonctions avant d’ajouter les Routes
if (!enrollmentController.register) {
    console.error(' ERREUR: La fonction register est introuvable dans enrollmentController.');
}

router.post('/', enrollmentController.register);
router.get('/', enrollmentController.getEnrollments);
router.get('/:id', enrollmentController.getEnrollmentById);
router.put('/:id', enrollmentController.updateEnrollmentStatus);
router.delete('/:id', enrollmentController.deleteEnrollment);

module.exports = router;
