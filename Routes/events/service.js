const express =  require('express');
const router = express.Router();
const {Service,servicesSchema} = require('../../Models/events/service');
const validate = require('../../Middlewares/events/validate');
const nodemailer = require("nodemailer");

const {addservice , getservice,getserviceByPack,updateService,deleteService} = require('../../Controllers/events/service/serviceController');

router.post('/service', validate(servicesSchema), addservice)

router.get('/service', getservice)

router.get('/getserviceByPack/:pack', getserviceByPack)
router.put("/updateService/:id", updateService)
router.delete('/deleteService/:id',deleteService) 

module.exports = router;
