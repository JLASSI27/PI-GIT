const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    workshop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workshop',
        required: [true, 'A task must belong to a workshop'],
    },
    title: {
        type: String,
        required: [true, 'A task must have a title'],
        trim: true,
        maxlength: [100, 'Title must be at most 100 characters'],
    },
    content: {
        type: String,
        required: [true, 'A task must have content'],
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Task', taskSchema);