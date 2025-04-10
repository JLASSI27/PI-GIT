const errorHandler = (err, req, res, next) => {
    console.error('🔥 Erreur:', err.message);

    // Formatage de la réponse d'erreur
    const response = {
        success: false,
        message: err.message || 'Erreur interne du serveur',
        details: process.env.NODE_ENV === 'development' ? err.stack : null
    };

    // Gestion spécifique des erreurs MongoDB
    if (err.name === 'CastError') {
        response.message = 'ID de ressource invalide';
        response.statusCode = 400;
    }

    // Gestion des erreurs de validation
    if (err.name === 'ValidationError') {
        response.message = Object.values(err.errors).map(e => e.message);
        response.statusCode = 400;
    }

    res.status(response.statusCode || 500).json(response);
};

module.exports = errorHandler;