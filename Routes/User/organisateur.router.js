const express = require('express');
const router = express.Router();


const getOneOrganisateur=require('../../Controllers/UserControllers/organisateur/getOne.controller');
const deleteOneOrganisateur=require('../../Controllers/UserControllers/organisateur/deleteOne.controller');
const updateOneOrganisateur=require('../../Controllers/UserControllers/organisateur/updateOne.controller');
const getAllOrganisateurs=require('../../Controllers/UserControllers/organisateur/getAll.controller');




router.get('/getOne/:id',getOneOrganisateur)
router.get('/getAll',getAllOrganisateurs)
router.delete('/deleteOne/:id',deleteOneOrganisateur)
router.put('/updateOne/:id',updateOneOrganisateur)

module.exports = router;
