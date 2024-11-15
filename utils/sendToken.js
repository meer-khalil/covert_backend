const sendToken = (user, statusCode, res, hasSubscription = false) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() +
        (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      message: "User Created Successfully",
      user: {
        ...user.toObject(), // Convert Mongoose document to plain object if needed
        hasSubscription, // Add the subscription status here
      },
      token,
    });
};

module.exports = sendToken;
