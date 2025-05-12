const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    workshopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    questions: {  // Changement majeur ici
        type: [String],  // Accepte désormais un tableau de strings
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Au moins une question est requise'
        }
    },
    passingScore: {
        type: Number,
        default: 5,
        min: 0,
        max: 10
    },
    duration: {
        type: Number,
        default: 30
    }
}, { timestamps: true });

// Supprimez le middleware pre('save') qui validait la structure des questions

module.exports = mongoose.model('Quiz', QuizSchema);