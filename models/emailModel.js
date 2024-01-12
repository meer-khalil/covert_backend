const mongoose = require('mongoose')


const emailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please Provide Email']
    }
})


module.exports = new mongoose.model('Email', emailSchema);