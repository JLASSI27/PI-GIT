const express = require('express');
const verifyOrganisateur = require("../../Controllers/UserControllers/admin/verifyOrganisateur.controller");
const router = express.Router();



router.patch('/verifyOrganisateur/:id', verifyOrganisateur);


module.exports = router;
