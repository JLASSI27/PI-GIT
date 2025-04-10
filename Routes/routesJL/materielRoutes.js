const express = require('express');
const router = express.Router();
const materielController = require('../../Controllers/controllersJl/materielController');

router.route('/')
    .post(materielController.createMateriel)
    .get(materielController.getMateriels);

router.route('/:id')
    .get(materielController.getMateriel)
    .put(materielController.updateMateriel)
    .delete(materielController.deleteMateriel);

module.exports = router;