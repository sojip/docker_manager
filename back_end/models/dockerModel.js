let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

let dockerSchema = new Schema({
  firstname: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  lastname: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },
  photo: {
    type: Buffer,
    default: undefined,
  },

  dateofbirth: {
    type: Date,
    required: true,
  },
  fingerprint: {
    type: String,
    required: true,
    default: "fingerprint",
  },
  createdOn: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = new Model("Docker", dockerSchema);
