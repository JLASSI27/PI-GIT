const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    workshopId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Workshop', 
        required: true 
    },
    score: { type: Number, required: true },
    downloadUrl: { type: String, required: true },
    digitalSignature: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', CertificateSchema);