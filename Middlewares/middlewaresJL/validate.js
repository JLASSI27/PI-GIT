const { Types } = require('mongoose');

const validateDepot = (req, res, next) => {
    const errors = [];
    const { nom, localisation, capacite } = req.body;

    // Validation du nom
    if (!nom) {
        errors.push({ field: 'nom', message: 'Le nom est obligatoire' });
    } else if (nom.length < 3) {
        errors.push({ field: 'nom', message: 'Minimum 3 caractères' });
    }

    // Validation de la localisation
    if (!localisation) {
        errors.push({ field: 'localisation', message: 'La localisation est obligatoire' });
    }

    // Validation de la capacité
    if (!capacite) {
        errors.push({ field: 'capacite', message: 'La capacité est obligatoire' });
    } else if (isNaN(capacite) || capacite < 1) {
        errors.push({ field: 'capacite', message: 'Doit être un nombre supérieur à 0' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

const validateMateriel = (req, res, next) => {
    const errors = [];
    const { nom, type, etat, depot } = req.body;
    const allowedTypes = ['outil', 'machine', 'autre'];
    const allowedEtats = ['disponible', 'en-maintenance', 'hors-service'];

    // Validation du nom
    if (!nom) {
        errors.push({ field: 'nom', message: 'Le nom est obligatoire' });
    } else if (nom.length < 3) {
        errors.push({ field: 'nom', message: 'Minimum 3 caractères' });
    }

    // Validation du type
    if (!type) {
        errors.push({ field: 'type', message: 'Le type est obligatoire' });
    } else if (!allowedTypes.includes(type)) {
        errors.push({
            field: 'type',
            message: `Types autorisés: ${allowedTypes.join(', ')}`
        });
    }

    // Validation de l'état (optionnel)
    if (etat && !allowedEtats.includes(etat)) {
        errors.push({
            field: 'etat',
            message: `États autorisés: ${allowedEtats.join(', ')}`
        });
    }

    // Validation du dépôt
    if (depot && !Types.ObjectId.isValid(depot)) {
        errors.push({
            field: 'depot',
            message: 'ID de dépôt invalide'
        });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

module.exports = {
    validateDepot,
    validateMateriel
};