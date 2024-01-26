const sanitize = require('mongo-sanitize');

const User = require('../models/user.model');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const ErrorHandler = require('../utils/errorHandler');

const { validateRegisterInput, validateLoginInput } = require("../validations/user.validation");
const UserService = require('../services/user.service');
const sendEmail = require('../utils/sendEmail');


// FrontEnd URL
let frontend_url = 'covertnest.com'
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
        .then(async (user) => {
            const resetPasswordUrl = `https://${frontend}/login`;
            let mailOptions = {
                from: 'info@covertnest.com',
                to: user.email,
                subject: 'User Created Successfully',
                html: `
                <h1>Successfully Created Account</h1>
                <p>Here You can Login: <a href="${resetPasswordUrl}">Click</a></p>
                `
            };

            await sendEmail(mailOptions)
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
        .then(async (user) => {
            if (!user) {
                return res.status(401).json({ message: "User Not Found" });
            }
            let passCheck = await user.comparePassword(sanitizedInput.password)
            if (passCheck) {
                sendToken(user, 201, res)
            } else {
                res.status(500).json({ message: "Password is Wrong!" });
            }
        }).catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Something Went Wrong" });
        })
}

exports.forgotPassword = async (req, res, next) => {
    console.log('req: ', req);

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User Not Found", 404));
    }

    const resetToken = await user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;
    const resetPasswordUrl = `https://${frontend}/password/reset/${resetToken}`;
    // const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}`;

    // const message = `Your password reset token is : \n\n ${resetPasswordUrl}`;

    try {
        let mailOptions = {
            from: 'info@covertnest.com',
            to: user.email,
            subject: 'Reset Your Password',
            html: `
            <p>Here is your link for reseting Password: <a href="${resetPasswordUrl}">Click</a></p>
            `
        };

        await sendEmail(mailOptions)

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: "Something Went Wrong" })
    }
}


// Reset Password
exports.resetPassword = asyncErrorHandler(async (req, res, next) => {

    console.log('Here is for Password Reset');

    // create hash token
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(404).json({
            message: "Invalid reset password token"
        });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
});