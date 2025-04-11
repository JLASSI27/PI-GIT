const express = require('express');
const router = express.Router();
const reviewController = require('../../Controllers/./Workshop/reviewController');

// Route pour créer un avis
router.post('/', reviewController.createReview);

// Route pour récupérer les avis d'un Workshop spécifique
router.get('/:workshopId', reviewController.getWorkshopReviews);

module.exports = router;
