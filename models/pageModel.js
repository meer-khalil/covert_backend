const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  data: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model("Page", pageSchema);
