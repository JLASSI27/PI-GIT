const express = require('express');
const { validateDepot } = require('../../Middlewares/middlewaresJL/validate');
const router = express.Router();
const {createDepot,getDepots,getDepot,updateDepot,deleteDepot} = require('../../Controllers/controllersJl/depotController');
const isAdmin = require("../../Middlewares/User/isAdmin.middleware");
const isOrganisateur = require("../../Middlewares/User/isOrganisateur.middleware");

router.route('/' ,validateDepot)
    .post(isAdmin,createDepot)
    .get(isOrganisateur,getDepots);

router.route('/:id', validateDepot)
    .get(getDepot)
    .put(isAdmin,updateDepot)
    .delete(isAdmin,deleteDepot);

module.exports = router;