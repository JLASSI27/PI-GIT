const mongoose = require('mongoose');
const Workshop = require('../../Models/workshop/Workshop');
const UserProgress = require('../../Models/workshop/UserProgress');
const Enrollment = require('../../Models/workshop/Enrollment');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * CRÉATION D'UN WORKSHOP
 * POST /api/workshops
 * Accès: Admin
 */
exports.createWorkshop = async (req, res) => {
    try {
        // 1. Préparation des données
        const workshopData = {
            ...req.body,
            image: req.file ? `images/${req.file.filename}` : null,
            startDate: new Date(req.body.startDate),
            endDate: req.body.endDate ? new Date(req.body.endDate) : null
        };

        // 2. Validation et sauvegarde
        const workshop = new Workshop(workshopData);
        await workshop.save();

        // 3. Réponse
        res.status(201).json({
            success: true,
            data: workshop
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * RÉCUPÉRATION DES WORKSHOPS 
 * GET /api/workshops
 */
exports.getWorkshops = async (req, res) => {
    try {
    
        //  Récupération des données
        const workshops = await Workshop.find()
            .populate('tasks')
            .populate('quiz.questions')
            .sort({ startDate: 1 }); // Tri par date de début

        //  Réponse
        res.json({
            success: true,
            data: workshops
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * RÉCUPÉRATION D'UN WORKSHOP SPÉCIFIQUE
 * GET /api/workshops/:id
 */
exports.getWorkshopById = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
            .populate('tasks')
            .populate('quiz'); // Référence vers le nouveau modèle Quiz

        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé'
            });
        }

        res.json({
            success: true,
            data: workshop
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * MISE À JOUR D'UN WORKSHOP
 * PUT /api/workshops/:id
 * Accès: Admin
 */
exports.updateWorkshop = async (req, res) => {
    try {
        const updates = {
            ...req.body,
            ...(req.file && { image: `uploads/${req.file.filename}` })
        };

        const workshop = await Workshop.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé'
            });
        }

        res.json({
            success: true,
            data: workshop
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * SUPPRESSION D'UN WORKSHOP
 * DELETE /api/workshops/:id
 * Accès: Admin
 */
exports.deleteWorkshop = async (req, res) => {
    try {
        const workshop = await Workshop.findByIdAndDelete(req.params.id);

        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé'
            });
        }

        // Nettoyage des données associées
        await Promise.all([
            UserProgress.deleteMany({ workshopId: req.params.id }),
            Enrollment.deleteMany({ workshopId: req.params.id })
        ]);

        res.json({
            success: true,
            message: 'Workshop et données associées supprimés'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * SOUMISSION D'UN QUIZ
 * POST /api/workshops/:id/quiz
 * Accès: User
 */
exports.submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body;
        const userId = req.user._id;
        const workshopId = req.params.id;

        // 1. Vérification du workshop
        const workshop = await Workshop.findById(workshopId);
        if (!workshop || !workshop.quiz) {
            return res.status(400).json({
                success: false,
                error: 'Quiz non disponible'
            });
        }

        // 2. Calcul du score
        const score = workshop.quiz.questions.reduce((total, q, i) => {
            return total + (answers[i] === q.correctAnswer ? 1 : 0);
        }, 0);

        const percentage = (score / workshop.quiz.questions.length) * 100;
        const isPassed = percentage >= workshop.quiz.passingScore;

        // 3. Génération du certificat si réussi
        let certificate = null;
        if (isPassed) {
            certificate = await this._generateCertificate(
                req.user.name,
                workshop.title,
                percentage,
                userId,
                workshopId
            );
        }

        // 4. Sauvegarde des résultats
        await UserProgress.findOneAndUpdate(
            { userId, workshopId },
            { quizScore: percentage }
        );

        // 5. Réponse
        res.json({
            success: true,
            score: percentage,
            passed: isPassed,
            certificate: certificate?.downloadUrl || null,
            discount: isPassed ? 25 : 0
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Génération de certificat
 */
exports._generateCertificate = async (userName, workshopTitle, score, userId, workshopId) => {
    // 1. Création du répertoire si inexistant
    const certDir = path.join(__dirname, '../../certificates');
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

    // 2. Configuration du PDF
    const certId = new mongoose.Types.ObjectId();
    const certFileName = `cert_${certId}.pdf`;
    const certPath = path.join(certDir, certFileName);
    const downloadUrl = `/certificates/${certFileName}`;

    // 3. Génération du contenu
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(certPath));

    // En-tête
    doc.fontSize(25)
       .text('Certificat de Réussite', { align: 'center' })
       .moveDown();

    // Corps
    doc.fontSize(16)
       .text(`Félicitations ${userName} !`, { align: 'center' })
       .moveDown()
       .text(`Vous avez réussi le workshop "${workshopTitle}"`)
       .text(`Score: ${score.toFixed(2)}%`)
       .moveDown();

    // Signature
    doc.text(process.env.DIGITAL_SIGNATURE || 'L\'équipe pédagogique')
       .moveDown()
       .text(`Date: ${new Date().toLocaleDateString()}`);

    doc.end();

    // 4. Sauvegarde en base
    const certificate = new Certificate({
        userId,
        workshopId,
        score,
        downloadUrl,
        issuedAt: new Date()
    });
    await certificate.save();

    // 5. Mise à jour de l'inscription
    await Enrollment.updateOne(
        { userId, workshopId },
        { certificateGenerated: true, certificateUrl: downloadUrl }
    );

    // 6. Envoi par email
    await this._sendCertificateEmail(
        req.user.email,
        workshopTitle,
        downloadUrl
    );

    return certificate;
};

/**
  Envoi du certificat par email
 */
exports._sendCertificateEmail = async (email, workshopTitle, certificateUrl) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Votre certificat pour ${workshopTitle}`,
        text: `Félicitations ! Votre certificat est disponible ici: ${process.env.BASE_URL}${certificateUrl}`
    });
};

/**
 * RÉCUPÉRATION DES TÂCHES D'UN WORKSHOP
 * GET /api/workshops/:id/tasks
 */
exports.getWorkshopTasks = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
            .populate('tasks');

        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé'
            });
        }

        res.json({
            success: true,
            data: workshop.tasks
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * RÉCUPÉRATION DU QUIZ D'UN WORKSHOP
 * GET /api/workshops/:id/quiz
 */
exports.getWorkshopQuiz = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
            .populate('quiz');

        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé'
            });
        }

        if (!workshop.quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz non trouvé pour ce workshop'
            });
        }

        res.json({
            success: true,
            data: workshop.quiz
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};