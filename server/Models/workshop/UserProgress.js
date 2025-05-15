const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Progress must belong to a user'],
    },
    workshop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: [true, 'Progress must belong to a workshop'],
    },
    lastTaskIndex: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

progressSchema.index({ user: 1, workshop: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);