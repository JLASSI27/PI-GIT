const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    workshopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['inscrit', 'en attente', 'annulé'],
        default: 'inscrit'
    },
    certificateGenerated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);