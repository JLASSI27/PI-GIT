// Models/workshop/Workshop.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true }, // en minutes
  content: {
    videos: [{ type: String }], // URLs des vidéos
   images: [{ type: String }], // URLs des images
    text: { type: String } // Contenu textuel
  },
  order: { type: Number, required: true }
});

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true } // index de la bonne réponse
});

const WorkshopSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  capacity: { type: Number },
  image: { type: String },
  averageRating: { type: Number, default: 0 },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  nextWorkshopDiscount: { type: Number, default: 0 } // réduction en % pour le prochain workshop
}, { timestamps: true });

module.exports = mongoose.model('Workshop', WorkshopSchema);