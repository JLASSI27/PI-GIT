const express =  require('express');
const router = express.Router();
const {Pack,packSchema} = require('../../Models/events/pack');
const validate = require('../../Middlewares/events/validate');

const {addpacks,getpacks,getPackByName,updatePack,deletePack} = require('../../Controllers/events/pack/packController');


router.post('/packs', validate(packSchema), addpacks )

router.get('/packs',getpacks)

router.get('/getPackByName/:Name', getPackByName)

router.put("/updatePack/:id" , validate(packSchema), updatePack)

router.delete('/deletePack/:id',deletePack) 


module.exports = router;
