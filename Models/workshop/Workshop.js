const mongoose = require('mongoose');

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
    averageRating: { type: Number, default: 0 }, // Ajout du champ averageRating
}, { timestamps: true });

module.exports = mongoose.model('Workshop', WorkshopSchema);
