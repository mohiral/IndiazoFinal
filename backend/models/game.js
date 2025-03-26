const mongoose = require("mongoose")
const { v4: uuidv4 } = require("uuid")

const gameSchema = new mongoose.Schema(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    crashPoint: {
      type: Number,
    },
    isAdminSet: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Game", gameSchema)

