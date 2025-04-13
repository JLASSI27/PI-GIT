const express = require('express');
const router = express.Router();
const materielController = require('../../Controllers/controllersJl/materielController');
const isAdmin = require("../../Middlewares/User/isAdmin.middleware");

router.route('/')
    .post(isAdmin,materielController.createMateriel)
    .get(isAdmin,materielController.getMateriels);

router.route('/:id')
    .get(isAdmin,materielController.getMateriel)
    .put(isAdmin,materielController.updateMateriel)
    .delete(isAdmin,materielController.deleteMateriel);

module.exports = router;