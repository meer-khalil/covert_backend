const passport = require("passport");
const User = require("../models/user.model");
const Local = require("passport-local");

exports.initPassportJS = () => {
  passport.use(
    new Local.Strategy({
      usernameField: 'email',
      passwordField: 'password'
    }, (username, password, done) => {
      console.log('username: ', username);
      console.log('password: ', password);
      User.findOne({ email: username }).select("+password")
        .then((user) => {
          if (!user) {
            return done(undefined, false, { message: `Username ${username} not found` });
          }
          console.log('user: ', user);
          if (!user.comparePassword(password)) {
            return done(undefined, false, { message: "Incorrect username or password" });
          }
          return done(undefined, user);
        })
        .catch((err) => done(err))
    })
  );
  passport.serializeUser((user, done) => done(undefined, user));

  passport.deserializeUser((id, done) =>
    User.findById(id, (err, user) => done(err, user))
  );
}
