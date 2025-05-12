const Enrollment = require('../../Models/workshop/Enrollment');
const Workshop = require('../../Models/workshop/Workshop');
const nodemailer = require('nodemailer');

// Fonction pour envoyer un email
const sendConfirmationEmail = async (email, status, workshopId = null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let subject = '';
        let message = '';

        // Charger les infos du workshop si l'ID est fourni
        let workshopInfo = '';
        if (workshopId) {
            const workshop = await Workshop.findById(workshopId);
            if (workshop) {
                workshopInfo = `
                    Titre : ${workshop.title}
                    Catégorie : ${workshop.category}
                    Prix : ${workshop.price} TND
                    Lieu : ${workshop.location}
                    Date de début : ${new Date(workshop.startDate).toLocaleDateString()}
                    Date de fin : ${new Date(workshop.endDate).toLocaleDateString()}
                    Capacité : ${workshop.capacity}
                    Description : ${workshop.description}
                `;
            }
        }

        if (status === 'en attente') {
            subject = 'Confirmation en attente';
            message = 'Votre inscription à l’atelier est en attente.';
        } else if (status === 'inscrit') {
            subject = 'Confirmation d’inscription';
            message = `Votre inscription à l’atelier a été confirmée.\n\nVoici les détails de l'atelier :\n${workshopInfo}`;
        } else {
            subject = 'Annulation d’inscription';
            message = 'Votre inscription à l’atelier a été annulée.';
        }

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text: message,
        });

    } catch (error) {
        console.error('Erreur lors de l’envoi de l’email:', error.message);
    }
};

// Inscription
exports.register = async (req, res) => {
    try {
        const { workshopId } = req.body;

        // Fetch the user from the req.user object (set in authentication middleware)
        const user = req.user;
        if (!user) {
            return res.status(400).json({ message: "Utilisateur non trouvé" });
        }

        // Fetch the workshop by ID
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({ message: "Atelier introuvable" });
        }

        const enrollmentCount = await Enrollment.countDocuments({ workshopId });

        if (enrollmentCount >= workshop.capacity) {
            return res.status(400).json({ message: "Capacité atteinte pour cet atelier" });
        }

        // Create a new enrollment using the user ID and workshop ID
        const enrollment = new Enrollment({
            workshopId,
            userId: user._id,
            image: `uploads/${req.file.filename}`,
            status: 'en attente'
        });

        await enrollment.save();

        // Send confirmation email to the user
        await sendConfirmationEmail(user.email, "en attente", workshopId);

        res.status(201).json(enrollment);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mettre à jour l'inscription (deviendra automatiquement "inscrit")
exports.updateEnrollmentStatus = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });

        enrollment.status = 'inscrit';
        await enrollment.save();

        // Send email confirmation using user email from req.user
        await sendConfirmationEmail(req.user.email, 'inscrit', enrollment.workshopId);

        res.json({ message: 'Statut mis à jour : "inscrit"' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer une inscription (statut "annulé" + mail)
exports.deleteEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });

        // Send cancellation email using the user’s email
        await sendConfirmationEmail(req.user.email, 'annulé');
        await Enrollment.findByIdAndDelete(req.params.id);

        res.json({ message: 'Inscription supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer toutes les inscriptions
exports.getEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find();
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Récupérer une inscription par ID
exports.getEnrollmentById = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) return res.status(404).json({ error: 'Inscription non trouvée' });
        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
