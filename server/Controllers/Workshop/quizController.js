const Quiz = require('../../Models/workshop/Quiz');
const Workshop = require('../../Models/workshop/Workshop');
const Enrollment = require('../../Models/workshop/Enrollment');
const {User} = require("../../Models/User/user.model");
const Certificate = require('../../Models/workshop/Certificate');
const path = require('path');
const crypto = require('crypto');
const generateCertificate = require('../../utils/pdfGenerator');
const {createTransport} = require("nodemailer");
async function sendCertificateEmail(userEmail, certificatePath, workshopTitle) {
    try {
        // Configuration du transporteur avec Gmail
        const transporter = createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Vérification du destinataire
        if (!userEmail) {
            throw new Error('Email du destinataire manquant');
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Certificat de réussite - ${workshopTitle}`,
            text: `Félicitations ! Vous avez réussi le workshop "${workshopTitle}".`,
            attachments: [{
                filename: 'certificate.pdf',
                path: certificatePath,
                contentType: 'application/pdf'
            }]
        };

        // Envoi de l'email
        console.log('Tentative d\'envoi d\'email à:', userEmail);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email envoyé avec succès:', info.response);
        return info;

    } catch (error) {
        console.error('Erreur d\'envoi d\'email:', error);
        throw error;
    }
}
// GET quiz by workshopId
exports.getQuizzesByWorkshop = async (req, res) => {
    try {
        const { workshopId } = req.params;

        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé',
            });
        }

        if (req.user.role !== 'admin') {
            const enrollment = await Enrollment.findOne({
                userId: req.user._id,
                workshopId,
                status: 'inscrit',
            });
            console.log(enrollment);
            if (!enrollment) {
                console.log("No enrollment found");
                return res.status(403).json({
                    success: false,
                    error: 'Vous n\'êtes pas autorisé à voir les quizzes pour ce workshop',
                });
            }
        }

        const quiz = await Quiz.findOne({ workshopId });
        res.status(200).json({
            success: true,
            data: quiz || null,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || 'Erreur lors de la récupération du quiz',
        });
    }
};

// POST create quiz (admin only)
exports.createQuiz = async (req, res) => {
    try {
        const { workshopId, title, questions, passingScore, duration } = req.body;

        // Validate workshop exists
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop non trouvé',
            });
        }

        // Validate questions
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Les questions doivent être un tableau non vide',
            });
        }

        for (const q of questions) {
            if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Chaque question doit avoir un texte, au moins 2 options, et un index de bonne réponse valide',
                });
            }
        }

        const quiz = new Quiz({
            workshopId,
            title,
            questions,
            passingScore,
            duration,
        });

        const savedQuiz = await quiz.save();

        // Update workshop's quiz reference
        workshop.quiz = savedQuiz._id;
        await workshop.save();

        res.status(201).json({
            success: true,
            data: savedQuiz,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || 'Erreur lors de la création du quiz',
        });
    }
};

// PUT update quiz (admin only)
exports.updateQuiz = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const { title, questions, passingScore, duration } = req.body;

        // Validate questions
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Les questions doivent être un tableau non vide',
            });
        }

        for (const q of questions) {
            if (!q.question || !Array.isArray(q.options) || q.options.length < 2 || !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                return res.status(400).json({
                    success: false,
                    error: 'Chaque question doit avoir un texte, au moins 2 options, et un index de bonne réponse valide',
                });
            }
        }

        const quiz = await Quiz.findOneAndUpdate(
            { workshopId },
            { title, questions, passingScore, duration },
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz non trouvé',
            });
        }

        res.status(200).json({
            success: true,
            data: quiz,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || 'Erreur lors de la mise à jour du quiz',
        });
    }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        if (!quizId || !answers) {
            return res.status(400).json({
                success: false,
                error: 'Quiz ID et réponses sont requis',
            });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz non trouvé',
            });
        }

        if (req.user.role !== 'admin') {
            const enrollment = await Enrollment.findOne({
                userId: req.user._id,
                workshopId: quiz.workshopId,
                status: 'inscrit',
            });
            if (!enrollment) {
                return res.status(403).json({
                    success: false,
                    error: 'Vous n\'êtes pas autorisé à soumettre ce quiz',
                });
            }
        }

        let score = 0;
        quiz.questions.forEach((question) => {
            if (answers[question._id] && Number(answers[question._id]) === question.correctAnswer) {
                score++;
            }
        });
        const percentage = (score / quiz.questions.length) * 100;
        const passed = percentage >= quiz.passingScore;
        if (passed) {
            const user = await User.findById(req.user._id);
            const workshop = await Workshop.findById(quiz.workshopId); // Fetch the workshop
            const certPath = path.join(__dirname, '../../certificates', `${req.user._id}_${quiz.workshopId}.pdf`);

            await generateCertificate(
                `${user.firstName} ${user.lastName}`,
                workshop.title,
                certPath
            );

            const certificate = new Certificate({
                userId: req.user._id,
                workshopId: quiz.workshopId,
                score: percentage,
                downloadUrl: `/certificates/${req.user._id}_${quiz.workshopId}.pdf`,
                digitalSignature: crypto.createHash('sha256')
                    .update(`${req.user._id}${quiz.workshopId}${Date.now()}`)
                    .digest('hex')
            });

            await certificate.save();

            if (user.email) {
                await sendCertificateEmail(user.email, certPath, workshop.title);
            }

            res.status(200).json({
                success: true,
                data: { score, percentage, passed, certificateUrl: certificate.downloadUrl }
            });
        } else {
            res.status(200).json({
                success: true,
                data: { score, percentage, passed }
            });
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message || 'Erreur lors de la soumission du quiz',
        });
    }
};