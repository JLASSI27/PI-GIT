
const axios = require('axios');
const Review = require('../../Models/workshop/Review');
const Workshop = require('../../Models/workshop/Workshop');

// Fonction pour analyser le sentiment avec l'API Hugging Face
const analyzeSentiment = async (comment) => {
    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
            { inputs: comment },
            { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
        );

        if (!response.data || !Array.isArray(response.data) || response.data.length === 0 || !response.data[0]) {
            throw new Error("Réponse invalide de l'API Hugging Face");
        }

        console.log("Réponse NLP Hugging Face :", response.data);

        // Trouver l'évaluation avec le score le plus élevé
        const bestSentiment = response.data[0].reduce((prev, current) => (prev.score > current.score ? prev : current));
        const score = parseInt(bestSentiment.label[0], 10); // Extraire le nombre de la chaîne

        // Déterminer le sentiment basé sur le score
        if (score <= 2) return "negative";
        if (score === 3) return "neutral";
        return "positive";

    } catch (error) {
        console.error("Erreur d'analyse de sentiment :", error);
        return "neutral"; // Valeur par défaut en cas d'erreur
    }
};

// Ajouter un avis avec analyse de sentiment
exports.createReview = async (req, res) => {
    try {
        const { workshopId, userEmail, rating, comment } = req.body;

        // Vérifier si le Workshop existe
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({ message: "Workshop non trouvé" });
        }

        // Analyser le sentiment du commentaire
        const sentiment = await analyzeSentiment(comment);

        // Créer un nouvel avis avec le sentiment détecté
        const newReview = new Review({
            workshopId,
            userEmail,
            rating,
            comment,
            sentiment, // Ajout du sentiment
        });

        await newReview.save();

        // Mettre à jour la moyenne des avis du Workshop
        await updateWorkshopRating(workshopId);

        res.status(201).json({ message: 'Avis créé avec succès', review: newReview });
    } catch (error) {
        console.error("Erreur lors de la création d'un avis :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // Trouver l'avis et le Workshop
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Avis non trouvé" });
        }

        const workshopId = review.workshopId;

        // Supprimer l'avis
        await review.deleteOne();

        // Mettre à jour la moyenne des avis du Workshop
        await updateWorkshopRating(workshopId);

        res.json({ message: "Avis supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'avis :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// Récupérer les avis d'un Workshop
exports.getWorkshopReviews = async (req, res) => {
    try {
        const { workshopId } = req.params;

        // Récupérer les avis pour un Workshop donné
        const reviews = await Review.find({ workshopId }).populate('workshopId', 'title');

        if (!reviews.length) {
            return res.status(404).json({ message: "Aucun avis trouvé pour ce Workshop" });
        }

        res.json(reviews);
    } catch (error) {
        console.error("Erreur lors de la récupération des avis :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// Mettre à jour la moyenne des avis d'un Workshop
const updateWorkshopRating = async (workshopId) => {
    try {
        // Récupérer tous les avis pour ce Workshop
        const reviews = await Review.find({ workshopId });

        if (reviews.length === 0) {
            // Si aucun avis n'est trouvé, on ne met pas à jour la moyenne
            console.log("Aucun avis trouvé pour ce Workshop.");
            return;
        }

        // Calculer la moyenne des avis
        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

        // Mettre à jour le Workshop avec la nouvelle moyenne
        const workshop = await Workshop.findByIdAndUpdate(workshopId, { averageRating }, { new: true });

        if (!workshop) {
            console.error(`Workshop avec l'ID ${workshopId} non trouvé`);
        } else {
            console.log(`Moyenne des avis mise à jour pour le workshop ${workshopId}: ${averageRating}`);
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour du rating du Workshop :", error);
    }
};
