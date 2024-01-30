const userRoutes = require('./user.routes');
const authRoutes = require("./auth.routes");
const blogRoutes = require("./blog.routes");
const categoryRoutes = require("./category.routes");

exports.initRoutes = (app) => {
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/blogs", blogRoutes);
  app.use("/api/v1/categories", categoryRoutes);
  app.use("/healthcheck", (req, res) => res.send("OK"));
}

