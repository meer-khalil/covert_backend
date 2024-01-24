const sanitize = require("mongo-sanitize");
const passport = require("passport");
const { validateLoginInput } = require('../validations/user.validation');

const UserService = require("../services/user.service");

exports.postLogin = (req, res, next) => {
  const { error } = validateLoginInput(req.body);

  if (error) return res.status(400).send({ message: error.details[0].message });

  let sanitizedInput = sanitize(req.body);

  sanitizedInput.email = req.body.email.toLowerCase();

  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (info && info.message === "Missing credentials") {
      return res.status(400).send({ message: "Missing credentials" });
    }
    if (!user) {
      return res.status(400).send({ message: "Invalid email or password." });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(401).send({ message: "Authentication failed", err });
      }
      res.status(200).send({ message: "Login success", user: UserService.getUser(user) });
    });
  })(req, res, next);
};


exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send({ message: "Logout failed", err });
    }
    req.sessionID = "";
    req.logout();
    res.status(200).send({ message: "Logout success" });
  });
};
