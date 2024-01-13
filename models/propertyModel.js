const mongoose = require('mongoose');
const getState = require('../utils/getState');

const propertySchema = new mongoose.Schema({
    // title: {
    //     type: String,
    //     trim: true
    // },
    // description: {
    //     type: String
    // },
    price: {
        type: Number
    },
    newPrice: {
        type: Number,
        default: function () {
            return this.price;
        },
    },
    reducedPrice: {
        type: Number,
        default: 0
    },
    rentalIncome: Number,
    actualCAP: {
        type: Number
    },
    proFormaCAP: {
        type: Number
    },
    occupancy: {
        type: Number
    },
    units: {
        type: Number
    },
    zipcode: {
        type: String
    },
    state: {
        type: String,
        default: function () {
            return getState(this.zipcode);
        }
    },
    images: [
        {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            destination: String,
            filename: String,
            path: String,
            size: Number
        }
    ],
    defaultImage: Number,
    files: [
        {
            fieldname: String,
            originalname: String,
            encoding: String,
            mimetype: String,
            destination: String,
            filename: String,
            path: String,
            size: Number
        }
    ],
    category: {
        type: String
    },
    published: {
        type: Boolean,
        default: false
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    features: {
        type: [String]
    },
    showHome: {
        type: Boolean,
        default: false
    },
    address: String,
    numberOfBeds: Number,
    numberOfBaths: Number,
    builtYear: String,
    sqFt: Number,
    lotSqft: Number,
    propertyType: String,
    propertyCondition: String,
    hasHoa: String,
    finance_cash: { type: Boolean },
    finance_sellerFinance: { type: Boolean },
    finance_mortgage: { type: Boolean, default: true },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Property', propertySchema);


// 0317-3311154