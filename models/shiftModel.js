let Schema = require("mongoose").Schema;
let Model = require("mongoose").model;

function addHours(numOfHours, date) {
  const dateCopy = new Date(date.getTime());

  dateCopy.setTime(dateCopy.getTime() + numOfHours * 60 * 60 * 1000);

  return dateCopy;
}

let shiftSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["jour", "nuit"],
      required: true,
    },
    startdate: {
      type: Date,
      required: true,
    },
    enddate: {
      type: Date,
      default: function () {
        if (this.startdate === undefined) return undefined;
        return addHours(12, this.startdate);
      },
    },
    duration: {
      type: Number,
      default: 720,
      required: true,
    },
    status: {
      type: String,
      enum: ["opened", "closed"],
      default: "opened",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = new Model("Shift", shiftSchema);
