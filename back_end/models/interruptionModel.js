let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

let interruptionSchema = new Schema({
  shift: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Shift",
  },
  duration: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = new Model("Interruption", interruptionSchema);
