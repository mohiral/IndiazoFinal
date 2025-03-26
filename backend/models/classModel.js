const mongoose = require("mongoose")

const betSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
    },
    gameId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    cashoutMultiplier: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["active", "won", "lost", "cancelled"],
      default: "active",
    },
    winAmount: {
      type: Number,
      default: 0,
    },
    isAutoCashout: {
      type: Boolean,
      default: false,
    },
    autoCashoutAt: {
      type: Number,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Bet", betSchema)

