var express = require('express');
var router = express.Router();
const { Commande } = require('../../Models/shope/commande');
const { Produit } = require('../../Models/shope/produit');

const {addcommande,getcommande,getcommandeByid,deletetcommande,updatecommande,CommandePDF,sendCommandePDFByEmail } = require('../../Controllers/shope/commande/commandeController'); 


router.post('/commande', addcommande ) 
 

router.get('/commande', getcommande)


router.get('/commande/:id', getcommandeByid) 

router.delete('/commande/:id', deletetcommande) 
   
   
router.put('/commande/:id', updatecommande)



router.get('/commande/:id/pdf', CommandePDF);
router.get('/commande/:id/send-pdf', sendCommandePDFByEmail);




module.exports = router;