const sanitize = require('mongo-sanitize');

const User = require('../models/user.model');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');

const { validateRegisterInput, validateLoginInput } = require("../validations/user.validation");
const UserService = require('../services/user.service');

exports.getUser = (req, res) => {
    const user = req.user;

    res.status(200).send({ message: "User info successfully retreived", user });
};

exports.postUser = async (req, res, next) => {

    const { error } = validateRegisterInput(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    let sanitizedInput = sanitize(req.body);

    try {
        let user = await UserService.findUserBy("email", sanitizedInput.email.toLowerCase());

        if (user) {
            return res.status(400).send({ message: "Email already registered. Take an another email" });
        }

        const newUser = UserService.createUser(sanitizedInput);
        try {
            const user = await UserService.saveUser(newUser);
            sendToken(user, 201, res);
        } catch (error) {
            console.log('Error: ', error);
            return res.status(500).send({ message: "Creation of user failed, try again." });
        }
    } catch (error) {
        console.log('error: ', error);
        return res.status(500).send("An unexpected error occurred");
    }
}

exports.createUser = async (req, res, next) => {

    const { error } = validateRegisterInput(req.body);
    if (error) return res.status(422).json({ message: error.details[0].message });

    let sanitizedInput = sanitize(req.body);


    let user = await User.findOne({ email: sanitizedInput.email.toLowerCase() });

    if (user) {
        return res.status(409).json({ message: "Email already registered. Take an another email" });
    }

    User.create(req.body)
        .then((user) => {
            sendToken(user, 201, res)
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json(err)
        })
}

exports.loginUser = async (req, res, next) => {

    const { error } = validateLoginInput(req.body);
    if (error) return res.status(422).json({ message: error.details[0].message });

    let sanitizedInput = sanitize(req.body);
    User.findOne({ email: sanitizedInput.email.toLowerCase() }).select("+password")
        .then((user) => {
            if (!user) {
                return res.status(401).json({ message: "User Not Found" });
            }
            if (user.comparePassword(sanitizedInput.password)) {
                sendToken(user, 201, res)
            }
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Something Went Wrong" });
        })
}