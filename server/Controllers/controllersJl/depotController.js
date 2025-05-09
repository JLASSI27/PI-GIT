const Depot = require('../../Models/modelesJL/Depot');
const fetch = (...args) => require('node-fetch').default(...args);

// CRUD Complet
exports.createDepot = async (req, res, next) => {
    try {
        // Géocodage
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(req.body.localisation)}&key=${process.env.OPENCAGE_API_KEY}`
        );
        const data = await response.json();

        if (!data.results?.length) {
            return res.status(400).json({ success: false, message: 'Localisation invalide' });
        }

        const depot = await Depot.create({
            ...req.body,
            coordonnees: data.results[0].geometry
        });

        res.status(201).json({ success: true, data: depot });
    } catch (err) {
        next(err);
    }
};

exports.getDepots = async (req, res, next) => {
    try {
        const depots = await Depot.find();
        res.json({ success: true, count: depots.length, data: depots });
    } catch (err) {
        next(err);
    }
};

exports.getDepot = async (req, res, next) => {
    try {
        const depot = await Depot.findById(req.params.id);
        if (!depot) return res.status(404).json({ success: false, message: 'Dépôt non trouvé' });
        res.json({ success: true, data: depot });
    } catch (err) {
        next(err);
    }
};

exports.updateDepot = async (req, res, next) => {
    try {
        const depot = await Depot.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!depot) return res.status(404).json({ success: false, message: 'Dépôt non trouvé' });
        res.json({ success: true, data: depot });
    } catch (err) {
        next(err);
    }
};

exports.deleteDepot = async (req, res, next) => {
    try {
        const depot = await Depot.findByIdAndDelete(req.params.id);
        if (!depot) return res.status(404).json({ success: false, message: 'Dépôt non trouvé' });
        res.json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};