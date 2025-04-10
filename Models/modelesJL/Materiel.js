const mongoose = require('mongoose');

const materielSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom du matériel est obligatoire'],
        minlength: [3, 'Le nom doit contenir au moins 3 caractères']
    },
    type: {
        type: String,
        required: [true, 'Le type est obligatoire'],
        enum: ['outil', 'machine', 'autre']
    },
    etat: {
        type: String,
        default: 'disponible',
        enum: ['disponible', 'en-maintenance', 'hors-service']
    },
    description: String,
    depot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Depot'
    }
}, { timestamps: true });

module.exports = mongoose.model('Materiel', materielSchema);