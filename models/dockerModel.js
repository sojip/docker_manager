let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

let dockerSchema = new Schema(
  {
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
    position: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    photo: {
      type: String,
      default: undefined,
    },
    cni: {
      type: String,
      default: undefined,
      required: true,
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
    personID: {
      type: Number,
      required: true,
    },
    createdOn: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = new Model("Docker", dockerSchema);
