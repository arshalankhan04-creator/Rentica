const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: [true, 'Please add a brand']
  },
  model: {
    type: String,
    required: [true, 'Please add a model']
  },
  year: {
    type: Number,
    required: [true, 'Please add a year']
  },
  kmDriven: {
    type: Number,
    required: [true, 'Please add km driven']
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'],
    required: [true, 'Please select a fuel type']
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    required: [true, 'Please select a transmission type']
  },
  bodyType: {
    type: String,
    enum: ['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Convertible', 'Wagon'],
    required: [true, 'Please select a body type']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please add a price per day']
  },
  availableFrom: {
    type: Date
  },
  availableTo: {
    type: Date
  },
  description: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'pending_review', 'rented', 'rejected'],
    default: 'pending_review'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for search/filtering
ListingSchema.index({ brand: 1, year: 1, pricePerDay: 1 });

module.exports = mongoose.model('Listing', ListingSchema);
