const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  seller: {
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
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  description: {
    type: String
  },
  images: {
    type: [String],
    default: []
  },
  
  // ML Fields - default null/empty
  conditionScore: {
    type: Number,
    default: null
  },
  detectedDamages: [
    {
      part: { type: String },
      damageType: { type: String },
      confidence: { type: Number }
    }
  ],
  predictedPriceMin: {
    type: Number,
    default: null
  },
  predictedPriceMax: {
    type: Number,
    default: null
  },
  confidenceLevel: {
    type: String,
    default: null
  },
  featureImportance: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  riskFlag: {
    type: String,
    enum: ['Low', 'Medium', 'High', null],
    default: null
  },
  fraudProbability: {
    type: Number,
    default: null
  },
  fraudReasons: [{
    type: String
  }],
  trustScore: {
    type: Number,
    default: null
  },
  trustBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
    status: {
      type: String,
      enum: ['active', 'pending_review', 'sold', 'rejected'],
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
ListingSchema.index({ brand: 1, year: 1, price: 1 });

module.exports = mongoose.model('Listing', ListingSchema);
