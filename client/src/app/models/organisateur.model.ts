const mongoose = require('mongoose');

const organisateurSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    default: 'organisateur',
    enum: ['organisateur']
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organisateur', organisateurSchema);
