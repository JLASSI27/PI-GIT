const path = require('path');
const Workshop = require('../../Models/workshop/Workshop');
const Enrollment = require('../../Models/workshop/Enrollment');
const Review = require('../../Models/workshop/Review');

// Création d’un workshop avec gestion d'image
exports.createWorkshop = async (req, res) => {
    try {
        const workshopData = { ...req.body };

        // Ajout de l'image si présente
        if (req.file) {
            workshopData.image = `../public/images/${req.file.filename}`; // Chemin sans slash initial
        }

        const workshop = new Workshop(workshopData);
        await workshop.save();
        res.status(201).json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer tous les workshops
exports.getWorkshops = async (req, res) => {
    try {
        const workshops = await Workshop.find();
        res.json(workshops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer un workshop par ID
exports.getWorkshopById = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id);
        if (!workshop) return res.status(404).json({ error: "Workshop non trouvé" });
        res.json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour un workshop avec option de mise à jour d'image
exports.updateWorkshop = async (req, res) => {
    try {
        const updatedData = { ...req.body };

        if (req.file) {
            updatedData.image = `uploads/${req.file.filename}`; // même format
        }

        const workshop = await Workshop.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un workshop
exports.deleteWorkshop = async (req, res) => {
    try {
        await Workshop.findByIdAndDelete(req.params.id);
        res.json({ message: "Workshop supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Recommandation de workshops selon les inscriptions précédentes
exports.recommendWorkshops = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: "L'email est requis pour obtenir des recommandations." });
        }

        const enrollments = await Enrollment.find({ email }).populate('workshopId');
        if (!enrollments.length) {
            return res.status(404).json({ message: "Aucune inscription trouvée pour cet utilisateur" });
        }

        const categories = [...new Set(enrollments.map(enroll => enroll.workshopId.category))];

        const recommendedWorkshops = await Workshop.find({
            category: { $in: categories },
            _id: { $nin: enrollments.map(enroll => enroll.workshopId._id) }
        });

        res.json(recommendedWorkshops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Calcul de la moyenne des notes d’un workshop
exports.getWorkshopAverageRating = async (req, res) => {
    try {
        const { workshopId } = req.params;

        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({ message: "Workshop non trouvé" });
        }

        const reviews = await Review.find({ workshopId });

        const averageRating = reviews.length > 0
            ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
            : 0;

        res.json({ averageRating });
    } catch (error) {
        console.error("Erreur lors de la récupération de la moyenne des notes :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
