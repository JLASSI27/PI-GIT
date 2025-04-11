const yup = require('yup');

// Schéma pour un dépôt
const depotSchema = yup.object({
    nom: yup.string().min(3, 'Le nom doit avoir au moins 3 caractères').required('Le nom est requis'),
    localisation: yup.string().required('La localisation est requise'),
    capacite: yup.number().positive('La capacité doit être un nombre positif').required('La capacité est requise'),
});

// Schéma pour un matériel
const materielSchema = yup.object({
    nom: yup.string().min(3, 'Le nom doit avoir au moins 3 caractères').required('Le nom est requis'),
    type: yup.string().oneOf(['outil', 'machine', 'autre'], 'Type invalide').required('Le type est requis'),
    etat: yup.string().oneOf(['disponible', 'en-maintenance', 'hors-service']).notRequired(),
    depot: yup.string().matches(/^[0-9a-fA-F]{24}$/, 'ID de dépôt invalide').required('Le dépôt est requis'),
});

// Middleware générique de validation
const validate = (schema) => async (req, res, next) => {
    try {
        req.body = await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        next();
    } catch (err) {
        return res.status(400).json({
            success: false,
            errors: err.inner.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }
};

module.exports = {
    validateDepot: validate(depotSchema),
    validateMateriel: validate(materielSchema)
};
