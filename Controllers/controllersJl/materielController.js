require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Materiel = require('../../Models/modelesJL/Materiel');
const Depot = require('../../Models/modelesJL/Depot'); // Import ajouté

// Initialisation Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });


 exports.createMateriel = async (req, res) => {
        try {
            const { nom, type, etat = 'disponible', depot } = req.body;

            // Validation des champs requis
            if (!nom || !type || !depot) {
                return res.status(400).json({
                    error: "Nom, type et dépôt requis"
                });
            }

            // Vérification de l'existence du dépôt
            const depotExiste = await Depot.findById(depot);
            if (!depotExiste) { // <-- Correction de la variable
                return res.status(404).json({
                    success: false,
                    message: "Dépôt non trouvé"
                });
            }



            // Génération description avec Gemini
            let description;
            try {
                const prompt = `Décris en 2 phrases ${nom} (${type}, état: ${etat})`;
                const result = await model.generateContent(prompt);
                description = (await result.response).text();
            } catch (aiError) {
                console.error("Erreur Gemini:", aiError);
                description = `${nom} (${type}) - Description générique`;
            }

            // Création avec affectation du dépôt
            const materiel = await Materiel.create({
                nom,
                type,
                etat,
                description,
                depot // Ajout de l'affectation du dépôt
            });

            res.status(201).json({
                success: true,
                data: materiel
            });

        } catch (err) {
            console.error("Erreur:", err);
            res.status(500).json({
                error: "Erreur serveur",
                details: process.env.NODE_ENV === 'development' ? err.message : null
            });
        }

};
    exports.getMateriels = async (req, res, next) => {
    try {
        const materiels = await Materiel.find();
        res.json({ success: true, count: materiels.length, data: materiels });
    } catch (err) {
        next(err);
    }
};
exports.getMateriel = async (req, res, next) => {
    try {
        const materiel = await Materiel.findById(req.params.id);
        if (!materiel) return res.status(404).json({ success: false, message: 'Matériel non trouvé' });
        res.json({ success: true, data: materiel });
    } catch (err) {
        next(err);
    }
};
exports.updateMateriel = async (req, res, next) => {
    try {
        const materiel = await Materiel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!materiel) return res.status(404).json({ success: false, message: 'Matériel non trouvé' });
        res.json({ success: true, data: materiel });
    } catch (err) {
        next(err);
    }

};
exports.deleteMateriel = async (req, res, next) => {
    try {
        const materiel = await Materiel.findByIdAndDelete(req.params.id);
        if (!materiel) return res.status(404).json({ success: false, message: 'Matériel non trouvé' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};