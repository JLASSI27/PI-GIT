const express =  require('express');
const router = express.Router();
const {Reservation,reservSchema} = require('../../Models/events/reservation');
const validate = require('../../Middlewares/events/validate');
const { Event } = require('../../Models/events/event');
const {addreservation,getreservation,getreservsByName,updateRsrv,deleteReservation} = require('../../Controllers/events/reservation/reservationController');


router.post('/reservation', validate(reservSchema), addreservation) 

router.get('/reservs', getreservation) 

router.get('/getreservsByName/:Nom', getreservsByName )

router.put("/updateRsrv/:id" , validate(reservSchema),updateRsrv) 

router.delete('/deleteReservation/:id', deleteReservation ) 


module.exports = router;
