const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  session: String,
  name: String,
  apiKey: String,
  tokenAdmin: String,
});

module.exports = mongoose.model("User", Schema);
