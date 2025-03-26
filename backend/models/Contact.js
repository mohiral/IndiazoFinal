const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['phone', 'whatsapp', 'email'],
    lowercase: true
  },
  value: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', ContactSchema);