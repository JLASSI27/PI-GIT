const express = require('express');
const { validateDepot } = require('../../Middlewares/middlewaresJL/validate');
const router = express.Router();
const {createDepot,getDepots,getDepot,updateDepot,deleteDepot} = require('../../Controllers/controllersJl/depotController');

router.route('/' ,validateDepot)
    .post(createDepot)
    .get(getDepots);

router.route('/:id', validateDepot)
    .get(getDepot)
    .put(updateDepot)
    .delete(deleteDepot);

module.exports = router;