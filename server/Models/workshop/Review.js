const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
