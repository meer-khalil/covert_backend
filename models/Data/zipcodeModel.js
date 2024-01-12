const mongoose = require('mongoose');

const zipCodeSchema = new mongoose.Schema({
    zipcode: {
        type: String,
        required: true,
        unique: true, // Ensure uniqueness
    },
    populationData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],

    employmentData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    medianGrossRateData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    numberOfUnitsData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    activeListeningCountData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    medianDaysOnMarketData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    medianListingPriceData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    newListingCountData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    pendingListingCountData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    priceReducedCountData:  [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    totalListingCount:  [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    medianGrossRent: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    medianIncome: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }],
    capData: [{
        year: {
            type: Number,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
    }] 
});

module.exports = mongoose.model('ZipCode', zipCodeSchema);
