let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

let shiftInstanceSchema = new Schema({
  shift: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Shift",
  },
  docker: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Docker",
  },
  startedshift: {
    type: Boolean,
    default: true,
    required: true,
  },
  endedshift: {
    type: Boolean,
    default: false,
    required: true,
  },
  operation: {
    type: {
      type: String,
      enum: ["navire", "yard", "magasin"],
      // required: true,
    },
    position: {
      type: String,
      lowercase: true,
      trim: true,
      // required: true,
    },
    description: {
      type: String,
      lowercase: true,
      trim: true,
      // required: true,
    },
    vessel: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  interruptions: {
    type: [Schema.Types.ObjectId],
    default: undefined,
    ref: "Interruption",
  },
});

module.exports = new Model("ShiftInstance", shiftInstanceSchema);
