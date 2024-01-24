const userRoutes = require('./user.routes');
const authRoutes = require("./auth.routes");

exports.initRoutes = (app) => {
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/healthcheck", (req, res) => res.send("OK"));
}

