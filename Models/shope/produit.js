
const mongoose = require("mongoose");
const yup = require('yup');


const produitSchema = new mongoose.Schema({
    nom: String,
    description: String,
    quantite: Number, 
    prix: Number,
    dispo: Boolean,
});


const produitValidationSchema = yup.object({
    body: yup.object({
        nom: yup.string().required("Le nom du produit est obligatoire"),
        description: yup.string().required("La description du produit est obligatoire"),
        quantite: yup.number()
            .required("La quantité est obligatoire")
            .typeError("La quantité doit être un nombre"),
        prix: yup.number()
            .required("Le prix est obligatoire")
            .typeError("Le prix doit être un nombre")
            .positive("Le prix doit être positif"),
        dispo: yup.boolean()
            .required("La disponibilité est obligatoire")
            .typeError("La disponibilité doit être un booléen (true/false)"),
    }),
});


const Produit = mongoose.model("Produit", produitSchema); 

module.exports = { Produit, produitValidationSchema }; 