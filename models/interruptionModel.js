let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

let interruptionSchema = new Schema(
  {
    shift: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Shift",
    },
    duration: {
      type: Number,
      required: true,
    },
    starttime: {
      type: String,
      required: true,
    },
    endtime: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = new Model("Interruption", interruptionSchema);
