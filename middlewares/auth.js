const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('./asyncErrorHandler');

exports.isAuthenticatedUser = asyncErrorHandler(async (req, res, next) => {

    // console.log('\n\n\nAuthorization:  ', req.headers.authorization, '\n\n\n');

    const token = req.headers?.authorization?.split('Bearer ')[1];

    console.log('token: ', token);
    if (!token) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET || 'WFFWf15115U842UGUBWF81EE858UYBY51BGBJ5E51Q');
    const user = await User.findById(decodedData.id);

    if (!user) {
        return next(new ErrorHandler("Please Login to Access", 401))
    }
    req.user = user;

    next();
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowed`, 403));
        }
        next();
    }
}