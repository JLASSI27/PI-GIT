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

// Get user's enrollments
exports.getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user._id }).populate('workshopId');
        console.log(enrollments);
        res.status(200).json({
            success: true,
            data: enrollments,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || 'Erreur lors de la récupération des inscriptions',
        });
    }
};

// Inscription
exports.register = async (req, res) => {
    try {
        const { workshopId } = req.body;

        // Fetch the user from the req.user object (set in authentication middleware)
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        // Fetch the workshop by ID
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Atelier introuvable',
            });
        }

        const enrollmentCount = await Enrollment.countDocuments({ workshopId });

        if (enrollmentCount >= workshop.capacity) {
            return res.status(400).json({
                success: false,
                error: 'Capacité atteinte pour cet atelier',
            });
        }

        // Create a new enrollment using the user ID and workshop ID
        const enrollment = new Enrollment({
            workshopId,
            userId: user._id,
            status: 'en attente',
        });

        await enrollment.save();

        // Send confirmation email to the user
        await sendConfirmationEmail(user.email, 'en attente', workshopId);

        res.status(201).json({
            success: true,
            data: enrollment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de l’inscription',
        });
    }
};

// Mettre à jour l'inscription (deviendra automatiquement "inscrit")
exports.updateEnrollmentStatus = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                error: 'Inscription non trouvée',
            });
        }

        enrollment.status = 'inscrit';
        await enrollment.save();

        // Fetch user to get email
        const user = await User.findById(enrollment.userId);
        if (user) {
            await sendConfirmationEmail(user.email, 'inscrit', enrollment.workshopId);
        }

        res.status(200).json({
            success: true,
            message: 'Statut mis à jour : "inscrit"',
            data: enrollment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la mise à jour du statut',
        });
    }
};

// Supprimer une inscription (statut "annulé" + mail)
exports.deleteEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                error: 'Inscription non trouvée',
            });
        }

        // Fetch user to get email
        const user = await User.findById(enrollment.userId);
        if (user) {
            await sendConfirmationEmail(user.email, 'annulé');
        }

        await Enrollment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Inscription supprimée avec succès',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la suppression de l’inscription',
        });
    }
};

// Récupérer toutes les inscriptions
exports.getEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find().populate('workshopId userId');
        res.status(200).json({
            success: true,
            data: enrollments,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la récupération des inscriptions',
        });
    }
};

// Récupérer une inscription par ID
exports.getEnrollmentById = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id).populate('workshopId userId');
        if (!enrollment) {
            return res.status(404).json({
                success: false,
                error: 'Inscription non trouvée',
            });
        }
        res.status(200).json({
            success: true,
            data: enrollment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la récupération de l’inscription',
        });
    }
};