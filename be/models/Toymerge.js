const mongoose = require('mongoose');

const toyMergeSchema = new mongoose.Schema(
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
        description: {
            type: String,
        },
        images: [
            {
                type: String,
            },
        ],
        specifications: {
            material: String,
            size: String,
            weight: String,
            requiresBattery: Boolean,
        },
        ageRange: {
            type: String,
        },
        origin: {
            type: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ToyMerge', toyMergeSchema);
