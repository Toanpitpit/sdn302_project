const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  toyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Toy',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  }
}, { _id: true }); // Give each cart item its own _id for easier updating/deleting

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
