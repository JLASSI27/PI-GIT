const express = require('express');
const router = express.Router();


const getOneOrganisateur=require('../../Controllers/UserControllers/organisateur/getOne.controller');
const deleteOneOrganisateur=require('../../Controllers/UserControllers/organisateur/deleteOne.controller');
const updateOneOrganisateur=require('../../Controllers/UserControllers/organisateur/updateOne.controller');
const getAllOrganisateurs=require('../../Controllers/UserControllers/organisateur/getAll.controller');
const isAdmin = require("../../Middlewares/User/isAdmin.middleware");




router.get('/getOne/:id',isAdmin,getOneOrganisateur)
router.get('/getAll',isAdmin,getAllOrganisateurs)
router.delete('/deleteOne/:id',isAdmin,deleteOneOrganisateur)
router.put('/updateOne/:id',isAdmin,updateOneOrganisateur)

module.exports = router;
