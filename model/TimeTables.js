const mongoose = require('mongoose');

const TimeTableShcema = mongoose.Schema(
  {
    busNumber: {
      type: Number,
    },
    bueId: {
      type: Number,
    },
    table: {
      type: Array,
    },
  },
  { autoIndex: false, timestamps: false },
);

const TimeTables = mongoose.model('TimeTables', TimeTableShcema);

module.exports = { TimeTables };
