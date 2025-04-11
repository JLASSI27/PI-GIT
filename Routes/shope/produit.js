var express = require('express');
var router = express.Router();
const { Produit, produitValidationSchema } = require('../../Models/shope/produit'); 
const validate = require('../../Middlewares/shope/validate');

const {addproduit,getproduit,deleteproduit, updateproduit, getproduitById} = require('../../Controllers/shope/produit/produitContoller'); 

router.get('/produit', getproduit) 

router.post('/produit', validate(produitValidationSchema), addproduit)

router.delete('/produit/:id', deleteproduit) 

router.put('/produit/:id',validate(produitValidationSchema), updateproduit)


router.get('/produit/:id', getproduitById) 


module.exports = router;  
