const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length >= 2 && v.every(opt => opt.trim().length > 0);
      },
      message: 'Chaque question doit avoir au moins 2 options non vides',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return Number.isInteger(v) && v >= 0 && v < this.options.length;
      },
      message: 'L\'index de la bonne réponse doit être valide',
    },
  },
});

const QuizSchema = new mongoose.Schema({
  workshopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workshop',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: {
    type: [QuizQuestionSchema],
    required: true,
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Au moins une question est requise',
    },
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100,
  },
  duration: {
    type: Number,
    default: 30,
    min: 1,
  },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);