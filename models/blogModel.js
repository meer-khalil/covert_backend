const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter Post Title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please Enter The Description"]
    },

    cover: {
        fieldname: String,
        originalname: String,
        encoding: String,
        mimetype: String,
        destination: String,
        filename: String,
        path: String,
        size: Number
    },

    content: {
        type: String
    },

    publish: {
        type: Boolean,
        default: false
    },
    tags: [{ type: String }],
    comments: {
        type: Boolean,
        default: false
    },
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

module.exports = mongoose.model('Blog', blogSchema);
