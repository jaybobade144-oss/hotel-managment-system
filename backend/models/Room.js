const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a room name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide a room type'],
    enum: ['Single', 'Double', 'Deluxe', 'Suite'],
    default: 'Standard'
  },
  price: {
    type: Number,
    required: [true, 'Please provide price per night']
  },
  description: {
    type: String,
    required: [true, 'Please provide a room description']
  },
  amenities: {
    type: [String],
    default: []
  },
  maxGuests: {
    type: Number,
    required: [true, 'Please provide max guests capacity'],
    default: 2
  },
  imageUrls: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
