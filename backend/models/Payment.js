const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    className: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    utr: {
      type: String,
    },
    upiId: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending",
    },
    adminApproval: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    transactionType: {
      type: String,
      enum: ["deposit", "withdrawal", "game_win", "game_loss", "withdrawal_refund"],
      default: "deposit",
    },
    rejectionReason: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    gameDetails: {
      betAmount: Number,
      multiplier: Number,
      result: String,
      gameId: String,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Payment", PaymentSchema)

