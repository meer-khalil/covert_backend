const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const Email = require('../models/emailModel');

exports.storeEmail = asyncErrorHandler(async (req, res, next) => {
    const { email } = req.body

    try {

        let entry = await Email.create({
            email
        })

        console.log('Entry: ', entry);

        res.status(200).json({
            entry
        })
    } catch (error) {
        console.log('Error: ', error)
        res.status(500).json({
            error
        })
    }
})


exports.getEmails = asyncErrorHandler(async (req, res, next) => {

    try {

        let emails = await Email.find();

        console.log('Entry: ', emails);

        res.status(200).json({
            emails
        })
    } catch (error) {
        console.log('Error: ', error)
        res.status(500).json({
            error
        })
    }
})