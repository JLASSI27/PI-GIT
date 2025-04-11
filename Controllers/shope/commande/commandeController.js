const { Commande } = require('../../../Models/shope/commande');
const { Produit } = require('../../../Models/shope/produit');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const nodemailer = require('nodemailer');

exports.addcommande = async function (req, res, next) {
  try {
    const { produits, adresseLivraison, num, email } = req.body;

    if (!Array.isArray(produits)) {
      return res.status(400).json({ message: 'Le champ "produits" doit être un tableau.' });
    }

    let total = 0;
    const produitsFormates = [];

    for (let item of produits) {
      const produit = await Produit.findById(item.produit);
      if (!produit) {
        return res.status(400).json({ message: `Produit avec l'ID ${item.produit} introuvable.` });
      }

      if (produit.quantite < item.quantite) {
        return res.status(400).json({ message: `Produit "${produit.nom}" en quantité insuffisante.` });
      }

      const prixUnitaire = produit.prix;
      total += prixUnitaire * item.quantite;

      produitsFormates.push({
        produit: produit._id,
        quantite: item.quantite,
        
      });
    }

    const nouvelleCommande = new Commande({
      produits: produitsFormates,
      adresseLivraison,
      total,
      num,
      email
    });

    const commandeSauvegardee = await nouvelleCommande.save();

    for (let item of produits) {
      await Produit.findByIdAndUpdate(item.produit, {
        $inc: { quantite: -item.quantite }
      });
    }

    res.status(201).json({
      message: 'Commande créée avec succès.',
      commande: commandeSauvegardee
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.getcommande = async function (req, res, next) {
  try {
    const commandes = await Commande.find().populate('produits.produit');
    res.json(commandes);
  } catch (error) {
    next(error);
  }
};

exports.getcommandeByid = async function (req, res, next) {
  try {
    const commande = await Commande.findById(req.params.id).populate('produits.produit');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }
    res.json(commande);
  } catch (error) {
    next(error);
  }
};

exports.deletetcommande = async function (req, res, next) {
  try {
    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    for (let item of commande.produits) {
      const produit = await Produit.findById(item.produit);
      if (produit) {
        produit.quantite += item.quantite;
        await produit.save();
      }
    }

    await commande.deleteOne();
    res.json({ message: 'Commande supprimée avec succès.' });
  } catch (error) {
    next(error);
  }
};

exports.updatecommande = async function (req, res, next) {
  try {
    const { produits, adresseLivraison, num, email } = req.body;

    if (!Array.isArray(produits)) {
      return res.status(400).json({ message: 'Le champ "produits" doit être un tableau.' });
    }

    if (!num || !email) {
      return res.status(400).json({ message: 'Le numéro de téléphone et l\'email sont requis.' });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'L\'email n\'est pas valide.' });
    }

    const commande = await Commande.findById(req.params.id);
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    for (let item of commande.produits) {
      const produit = await Produit.findById(item.produit);
      if (produit) {
        produit.quantite += item.quantite;
        await produit.save();
      }
    }

    for (let item of produits) {
      const produit = await Produit.findById(item.produit);
      if (!produit || produit.quantite < item.quantite) {
        return res.status(400).json({ message: `Produit ${produit ? produit.nom : 'inconnu'} en quantité insuffisante.` });
      }
    }

    let total = 0;
    for (let item of produits) {
      const produit = await Produit.findById(item.produit);
      total += produit.prix * item.quantite;
      produit.quantite -= item.quantite;
      await produit.save();
    }

    commande.produits = produits;
    commande.adresseLivraison = adresseLivraison;
    commande.total = total;
    commande.num = num;
    commande.email = email;

    const commandeModifiee = await commande.save();
    res.json(commandeModifiee);
  } catch (error) {
    next(error);
  }
};



exports.CommandePDF = async function (req, res, next) {
  try {
    const commande = await Commande.findById(req.params.id).populate('produits.produit');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    const doc = new PDFDocument();
    const stream = new Readable();
    stream._read = () => {};

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=commande.pdf');

    doc.pipe(res);
    doc.fontSize(20).text('Détails de la commande', { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`ID: ${commande._id}`);
    doc.text(`Téléphone: ${commande.num}`);
    doc.text(`Email: ${commande.email}`);
    doc.text(`Adresse de livraison: ${commande.adresseLivraison}`);
    doc.text(`Total: ${commande.total} TND`);
    doc.text(`Statut paiement: ${commande.paiementStatus || 'Non payé'}`);
    doc.moveDown();
    doc.text('Produits commandés :');
    doc.moveDown();

    commande.produits.forEach(item => {
      const p = item.produit;
      doc.text(`- ${p.nom} | Prix: ${p.prix} TND | Quantité: ${item.quantite}`);
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.sendCommandePDFByEmail = async function (req, res, next) {
  try {
    const commande = await Commande.findById(req.params.id).populate('produits.produit');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée.' });
    }

    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'mounahamrouni43@gmail.com',
          pass: 'pnma nkhu fivy fzkf'
        }
      });

      const mailOptions = {
        from: 'mounahamrouni43@gmail.com',
        to: 'ghazinasri243@gmail.com',
        subject: 'Votre commande - Détails en pièce jointe',
        text: 'Bonjour, veuillez trouver ci-joint le récapitulatif de votre commande.',
        attachments: [
          {
            filename: 'commande.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          }
        ],
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'PDF envoyé avec succès '  });
    });

    doc.fontSize(18).text('Facture de commande', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Commande ID : ${commande._id}`);
    //doc.text(`Client : ${commande.Client}`);
    doc.text(`Téléphone : ${commande.num}`);
    doc.text(`Client: ${commande.client}`);
    doc.text(`Adresse de livraison : ${commande.adresseLivraison}`);
    doc.text(`Adresse maile : ${commande.email}`);
    doc.moveDown();

    doc.fontSize(14).text('Produits commandés :');
    commande.produits.forEach(item => {
      const produit = item.produit;
      doc.fontSize(12).text(`- ${produit.nom} x${item.quantite} à ${produit.prix} $`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total : ${commande.total} $`);
    doc.text(`Statut de paiement : ${commande.paiementStatus || 'Non payé'}`);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du PDF.', error: error.message });
  }
};