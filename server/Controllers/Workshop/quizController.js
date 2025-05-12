const Quiz = require('../../Models/workshop/Quiz');
const Workshop = require('../../Models/workshop/Workshop');

exports.getQuiz = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const quiz = await Quiz.findOne({ workshopId });
        
        if (!quiz) {
            return res.status(404).json({ 
                success: false,
                error: "Quiz non trouvé" 
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.createQuiz = async (req, res) => {
    try {
        const { workshopId, title, questions, passingScore, duration } = req.body;

        // Validation simplifiée
        if (!Array.isArray(questions)) {
            return res.status(400).json({ 
                success: false,
                error: "Les questions doivent être un tableau" 
            });
        }

        const quiz = new Quiz({
            workshopId,
            title,
            questions: questions.map(q => String(q)), // Conversion en string
            passingScore,
            duration
        });

        const savedQuiz = await quiz.save();
        
        res.status(201).json({
            success: true,
            data: savedQuiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const updates = req.body;

        const quiz = await Quiz.findOneAndUpdate(
            { workshopId },
            updates,
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: "Quiz non trouvé"
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};