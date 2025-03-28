// Script to migrate existing gameIds to consistent UUID format
const mongoose = require("mongoose")
const Payment = require("./models/Payment")
const CrashHistory = require("./models/crash-history")
const { normalizeGameId } = require("./game-id-utils")

// MongoDB connection
mongoose
  .connect("mongodb+srv://harishkumawatkumawat669:7FiBpE7v7lNyDp6G@cluster0.ogeix.mongodb.net/Avitor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err))

async function migrateGameIds() {
  console.log("Starting gameId migration...")

  // Step 1: Get all crash history records
  const crashHistories = await CrashHistory.find({}).lean()
  console.log(`Found ${crashHistories.length} crash history records`)

  // Step 2: Process each crash history record
  let crashUpdates = 0
  for (const crash of crashHistories) {
    const originalGameId = crash.gameId
    const normalizedGameId = normalizeGameId(originalGameId)

    if (originalGameId !== normalizedGameId) {
      console.log(`Updating crash history gameId: ${originalGameId} -> ${normalizedGameId}`)
      await CrashHistory.updateOne({ _id: crash._id }, { gameId: normalizedGameId })
      crashUpdates++
    }
  }

  // Step 3: Get all payment records with game transactions
  const payments = await Payment.find({
    transactionType: { $in: ["game_win", "game_loss"] },
    "gameDetails.gameId": { $exists: true },
  }).lean()
  console.log(`Found ${payments.length} payment records with game transactions`)

  // Step 4: Process each payment record
  let paymentUpdates = 0
  for (const payment of payments) {
    if (!payment.gameDetails || !payment.gameDetails.gameId) continue

    const originalGameId = payment.gameDetails.gameId
    const normalizedGameId = normalizeGameId(originalGameId)

    if (originalGameId !== normalizedGameId) {
      console.log(`Updating payment gameId: ${originalGameId} -> ${normalizedGameId}`)
      await Payment.updateOne({ _id: payment._id }, { "gameDetails.gameId": normalizedGameId })
      paymentUpdates++
    }
  }

  console.log(`Migration complete. Updated ${crashUpdates} crash records and ${paymentUpdates} payment records.`)
  process.exit(0)
}

migrateGameIds().catch((err) => {
  console.error("Error during migration:", err)
  process.exit(1)
})

