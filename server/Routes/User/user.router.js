const express = require('express');
const router = express.Router();


const getOneUser=require('../../Controllers/UserControllers/user/getOne.controller');
const deleteOneUser=require('../../Controllers/UserControllers/user/deleteOne.controller');
const updateOneUser=require('../../Controllers/UserControllers/user/updateOne.controller');
const getAllUsers=require('../../Controllers/UserControllers/user/getAll.controller');




router.get('/getOne/:id',getOneUser)
router.get('/getAll',getAllUsers)
router.delete('/deleteOne/:id',deleteOneUser)
router.put('/updateOne/:id',updateOneUser)

module.exports = router;
