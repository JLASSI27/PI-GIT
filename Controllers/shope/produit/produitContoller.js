


const { Produit } = require('../../../Models/shope/produit'); 



exports.addproduit = async function(req, res, next) { 
    try {
      const newProduit = new Produit({ 
        nom: req.body.nom,
        description: req.body.description,
        quantite: req.body.quantite,
        prix: req.body.prix,
        dispo: req.body.dispo 
      });
  
      const savedProduit = await newProduit.save();
      res.json(savedProduit);
    } catch (error) {
      next(error);
    }
  };

exports.getproduit = async function(req, res, next) {
    try {
      const produits = await Produit.find(); 
      res.json(produits);
    } catch (error) {
      next(error);
    }
  };

  exports.deleteproduit = async function (req, res, next) {
    try {
      const id = req.params.id;
      const result = await Produit.findByIdAndDelete(id);
      
      if (!result) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
  
      res.json({ message: "Produit supprimé avec succès", produit: result });
    } catch (error) {
      next(error);
    }
  }; 

exports.updateproduit = async function (req, res, next) {
  try {
    const id = req.params.id;
    const updatedProduit = await Produit.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true } 
    );

    if (!updatedProduit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json({ message: "Produit mis à jour avec succès", produit: updatedProduit });
  } catch (error) {
    next(error);
  }
};


exports.getproduitById = async function (req, res, next) {
  try {
    const id = req.params.id;
    const produit = await Produit.findById(id);

    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(produit);
  } catch (error) {
    next(error);
  }
};
