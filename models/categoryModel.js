const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String
    },
    blogs: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Blog'
        }
    ]
})

module.exports = mongoose.model('Category', categorySchema);