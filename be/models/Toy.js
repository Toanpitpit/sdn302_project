const mongoose = require('mongoose');

const toySchema = new mongoose.Schema(
  {

    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    depositValue: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'PENDING', 'RENTED', 'UNAVAILABLE'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Toy', toySchema);
