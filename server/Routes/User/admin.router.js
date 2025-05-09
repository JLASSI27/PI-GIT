const express = require('express');
const verifyOrganisateur = require("../../Controllers/UserControllers/admin/verifyOrganisateur.controller");
const isAdmin = require("../../Middlewares/User/isAdmin.middleware");
const router = express.Router();



router.patch('/verifyOrganisateur/:id',isAdmin, verifyOrganisateur);


module.exports = router;
