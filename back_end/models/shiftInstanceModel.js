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
    default: false,
    required: true,
  },
  endedshift: {
    type: Boolean,
    default: false,
    required: true,
  },
  interruptions: {
    type: [Schema.Types.ObjectId],
    default: undefined,
    ref: "Interruption",
  },
});

module.exports = new Model("ShiftInstance", shiftInstanceSchema);
