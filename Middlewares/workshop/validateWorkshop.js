const { body, validationResult } = require('express-validator');

exports.validateWorkshop = [
    body('title').notEmpty().withMessage('Le titre est obligatoire'),
    body('description').optional(),
    body('category').notEmpty().withMessage('La catégorie est obligatoire'),
    body('price').isFloat({ gt: 0 }).withMessage('Le prix doit être un nombre positif'),
    body('location').optional(),

    // Validation de la date au format YYYY-MM-DD
    body('startDate')
        .notEmpty().withMessage('La date de début est obligatoire')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Le format de la date doit être YYYY-MM-DD')
        .custom(value => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('La date doit être valide');
            }
            return true;
        }),

    body('endDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Le format de la date doit être YYYY-MM-DD')
        .custom((value, { req }) => {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(value);
            if (endDate < startDate) {
                throw new Error('La date de fin doit être après la date de début');
            }
            return true;
        }),

    body('capacity').optional().isInt({ gt: 0 }).withMessage('La capacité doit être un entier positif'),
    body('image').optional().isURL().withMessage('L\'image doit être une URL valide'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
