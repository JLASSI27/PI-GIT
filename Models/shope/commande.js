const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({

  produits: [
    {
      produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Produit",
        required: true
      },
      quantite: {
        type: Number,
        required: true,
        min: 1
      },
    
    }
  ],

  
  dateCommande: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    enum: ["en attente", "confirmée", "expédiée", "livrée", "annulée"],
    default: "en attente"
  },

  adresseLivraison: {
    type: String,
    required: true
  },
 
  total: {
    type: Number,
    required: true,
    min: 0
  },

  paiementStatus: {
    type: String,
    enum: ["en attente", "payé", "échoué"],
    default: "en attente"
  },

  num: {
    type: Number,
    required: true
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  }
});

const Commande = mongoose.model("Commande", commandeSchema);

module.exports = { Commande };