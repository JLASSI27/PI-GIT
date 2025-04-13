const express = require('express');
const router = express.Router();
const workshopController = require('../../Controllers/Workshop/workshopController');
const { validateWorkshop } = require('../../Middlewares/workshop/validateWorkshop');
const upload = require('../../Middlewares/workshop/upload');
const isAdmin = require("../../Middlewares/User/isAdmin.middleware"); // Import du middleware d'upload

//  Création d'un workshop avec upload + validation
router.post('/', upload.single('image'), validateWorkshop,isAdmin, workshopController.createWorkshop);

//  Modification d'un workshop avec option de mise à jour d'image
router.put('/:id', upload.single('image'), validateWorkshop,isAdmin, workshopController.updateWorkshop);

// Recommandations
router.get('/recommend', workshopController.recommendWorkshops);

// Autres opérations
router.get('/', workshopController.getWorkshops);
router.get('/:id', workshopController.getWorkshopById);
router.delete('/:id',isAdmin, workshopController.deleteWorkshop);

// Moyenne des avis
router.get('/:workshopId/average-rating', workshopController.getWorkshopAverageRating);

module.exports = router;