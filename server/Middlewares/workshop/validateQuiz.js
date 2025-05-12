const { body, validationResult } = require('express-validator');

exports.validateQuiz = [
    // Validation de l'ID de l'atelier
    body('workshopId')
        .notEmpty().withMessage('L\'ID de l\'atelier est obligatoire')
        .isMongoId().withMessage('ID d\'atelier invalide'),

    // Validation du titre
    body('title')
        .notEmpty().withMessage('Le titre est obligatoire')
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),

    // Validation des questions (tableau de strings)
    body('questions')
        .isArray({ min: 1 }).withMessage('Au moins une question est requise')
        .custom((questions) => {
            // Vérifie que chaque élément est une string non vide
            return questions.every(q => typeof q === 'string' && q.trim().length > 0);
        }).withMessage('Chaque question doit être une chaîne de caractères non vide'),

    // Validation optionnelle du passingScore
    body('passingScore')
        .optional()
        .isInt({ min: 0, max: 10 }).withMessage('Le score de passage doit être entre 0 et 10'),

    // Validation optionnelle de la durée
    body('duration')
        .optional()
        .isInt({ min: 1, max: 300 }).withMessage('La durée doit être entre 1 et 300 minutes'),

    // Middleware de traitement des erreurs
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            // Formatage des erreurs pour une meilleure lisibilité
            const formattedErrors = errors.array().map(err => ({
                champ: err.path,
                message: err.msg,
                valeur: err.value
            }));

            return res.status(400).json({ 
                success: false,
                message: 'Erreurs de validation',
                errors: formattedErrors
            });
        }
        
        // Si aucune erreur, passez au middleware suivant
        next();
    }
];