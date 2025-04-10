const mongoose = require('mongoose');

const depotSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        minlength: [3, 'Minimum 3 caractères']
    },
    localisation: {
        type: String,
        required: [true, 'La localisation est obligatoire']
    },
    capacite: {
        type: Number,
        required: [true, 'La capacité est obligatoire'],
        min: [1, 'Capacité minimum: 1']
    },
    coordonnees: {
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Depot', depotSchema);