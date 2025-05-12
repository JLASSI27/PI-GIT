// Controllers/workshop/progressController.js
const UserProgress = require('../../Models/workshop/UserProgress');
const Workshop = require('../../Models/workshop/Workshop');
const Certificate = require('../../Models/workshop/Certificate');
const Enrollment = require('../../Models/workshop/Enrollment');
const Task = require('../../Models/workshop/Task'); // Ajout du modèle Task
const { User } = require('../../Models/User/user.model'); // Correction de l'import
const generateCertificate = require('../../utils/pdfGenerator');
const nodemailer = require('nodemailer');
const path = require('path');
const crypto = require('crypto');

// Start or get progress
exports.startOrGetProgress = async (req, res) => {
    try {
        const { workshopId } = req.body;
        const userId = req.user._id;

        let progress = await UserProgress.findOne({ userId, workshopId });
        
        if (!progress) {
            // Créer un nouveau progrès si n'existe pas
            progress = new UserProgress({
                userId,
                workshopId,
                lastTaskOrder: 0,
                completedTasks: [],
                taskAnswers: []
            });
            await progress.save();
        }

        res.status(200).json(progress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Complete a task
exports.completeTask = async (req, res) => {
    try {
        const { workshopId, taskId, answers } = req.body;
        
        // Vérification plus stricte de l'authentification
        if (!req.user || !req.user._id) {
            return res.status(401).json({ 
                error: "Utilisateur non authentifié ou ID utilisateur manquant" 
            });
        }
        
        console.log('User from token:', req.user); // Debug log
        
        const userId = req.user._id;
        
        if (!workshopId || !taskId) {
            return res.status(400).json({ 
                error: "workshopId et taskId sont requis" 
            });
        }

        // Vérifier si la progression existe
        let progress = await UserProgress.findOne({ 
            userId: userId,
            workshopId: workshopId 
        });
        
        console.log('Existing progress:', progress); // Debug log
        
        if (!progress) {
            // Création avec userId explicite
            progress = new UserProgress({
                userId: userId,
                workshopId: workshopId,
                lastTaskOrder: 0,
                completedTasks: [],
                taskAnswers: []
            });
            await progress.save();
        }

        // Mise à jour avec userId explicite
        progress = await UserProgress.findOneAndUpdate(
            { 
                userId: userId,
                workshopId: workshopId 
            },
            {
                $addToSet: { completedTasks: taskId },
                $push: { 
                    taskAnswers: { 
                        taskId, 
                        answers 
                    } 
                },
                $inc: { lastTaskOrder: 1 }
            },
            { 
                new: true,
                runValidators: true 
            }
        );

        if (!progress) {
            return res.status(404).json({ 
                error: "Impossible de mettre à jour la progression" 
            });
        }

        res.status(200).json(progress);
    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Modifier la méthode submitQuiz pour utiliser le nouveau modèle Quiz
exports.submitQuiz = async (req, res) => {
    try {
        const { workshopId, answers } = req.body;
        const userId = req.user._id;

        console.log('Submitting quiz with:', { workshopId, answers, userId });

        // Modifions la requête pour s'assurer que le quiz est bien peuplé
        const workshop = await Workshop.findById(workshopId)
            .populate({
                path: 'quiz',
                model: 'Quiz',
                select: 'questions passingScore'
            });

        console.log('Workshop found:', workshop);
        console.log('Quiz data:', workshop?.quiz);

        if (!workshop) {
            return res.status(404).json({ error: "Workshop non trouvé" });
        }

        if (!workshop.quiz) {
            return res.status(404).json({ error: "Quiz non trouvé pour ce workshop" });
        }

        // Vérification du nombre de réponses
        if (answers.length !== workshop.quiz.questions.length) {
            return res.status(400).json({ 
                error: `Le nombre de réponses (${answers.length}) ne correspond pas au nombre de questions (${workshop.quiz.questions.length})` 
            });
        }

        // Calcul du score
        let score = 0;
        workshop.quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        const percentageScore = (score / workshop.quiz.questions.length) * 10;

        // Mise à jour de la progression
        let progress = await UserProgress.findOneAndUpdate(
            { userId, workshopId },
            { 
                $set: { quizScore: percentageScore }
            },
            { new: true, upsert: true }
        );

        const response = {
            success: true,
            score: percentageScore,
            message: "Quiz complété",
            passed: percentageScore >= 5
        };

        // Génération du certificat si score suffisant
        if (percentageScore >= 5) {
            const user = await User.findById(userId);
            const certPath = path.join(__dirname, '../../certificates', `${userId}_${workshopId}.pdf`);
            
            await generateCertificate(
                `${user.firstName} ${user.lastName}`, 
                workshop.title, 
                certPath
            );

            // Créer l'entrée du certificat
            const certificate = new Certificate({
                userId,
                workshopId,
                score: percentageScore,
                downloadUrl: `/certificates/${userId}_${workshopId}.pdf`,
                digitalSignature: crypto.createHash('sha256')
                    .update(`${userId}${workshopId}${Date.now()}`)
                    .digest('hex')
            });

            await certificate.save();
            response.certificateUrl = certificate.downloadUrl;

            // Envoyer le certificat par email
            if (user.email) {
                await sendCertificateEmail(user.email, certPath, workshop.title);
                response.emailSent = true;
            }
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Fonction d'envoi d'email
async function sendCertificateEmail(userEmail, certificatePath, workshopTitle) {
    try {
        // Configuration du transporteur avec Gmail
        const transporter = nodemailer.createTransport({
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

// Get progress (resume where stopped)
exports.getProgress = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const userId = req.user._id;

        const progress = await UserProgress.findOne({ userId, workshopId })
            .populate({
                path: 'completedTasks',
                model: 'Task',
                select: 'title description order type'
            })
            .populate('workshopId');

        if (!progress) {
            return res.status(404).json({ error: "Progression non trouvée" });
        }

        res.status(200).json(progress);
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ error: error.message });
    }
};
