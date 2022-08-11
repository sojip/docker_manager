let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

let userSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    enum: ["supervisor", "admin"],
    required: true,
  },
});

module.exports = new Model("User", userSchema);
