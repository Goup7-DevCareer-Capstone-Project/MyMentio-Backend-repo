const mongoose = require("mongoose");

const TherapyHistorySchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

const TherapyHistory = mongoose.model("TherapyHistory", TherapyHistorySchema);
module.exports = TherapyHistory;
