// This utility script can be used to sync existing game IDs between collections
const mongoose = require("mongoose")
const Payment = require("../models/Payment")
const CrashHistory = require("../models/crash-history")

// Connect to MongoDB (replace with your connection string)
mongoose.connect("mongodb://localhost:27017/your_database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const syncGameIds = async () => {
  try {
    console.log("Starting game ID synchronization...")

    // Get all crash history records
    const crashHistories = await CrashHistory.find().lean()
    console.log(`Found ${crashHistories.length} crash history records`)

    // Get all game transactions
    const gameTransactions = await Payment.find({
      transactionType: { $in: ["game_win", "game_loss"] },
      "gameDetails.gameId": { $exists: true },
    }).lean()
    console.log(`Found ${gameTransactions.length} game transactions`)

    // Create a map of crash history game IDs
    const crashHistoryMap = new Map()
    crashHistories.forEach((crash) => {
      crashHistoryMap.set(crash.gameId, crash)
    })

    // Count of updates needed
    let updateCount = 0

    // Process each game transaction
    for (const transaction of gameTransactions) {
      const currentGameId = transaction.gameDetails.gameId

      // Skip if no game ID
      if (!currentGameId) continue

      // Check if this transaction's game ID exists in crash history
      if (!crashHistoryMap.has(currentGameId)) {
        // This transaction has a game ID that doesn't match any crash history
        console.log(`Transaction ${transaction._id} has gameId ${currentGameId} which doesn't match any crash history`)

        // Try to find a matching crash history by timestamp
        const transactionDate = new Date(transaction.createdAt)
        let bestMatch = null
        let smallestTimeDiff = Number.POSITIVE_INFINITY

        for (const [crashId, crash] of crashHistoryMap.entries()) {
          const crashDate = new Date(crash.timestamp)
          const timeDiff = Math.abs(crashDate - transactionDate)

          // If this crash is closer in time than our current best match
          if (timeDiff < smallestTimeDiff) {
            smallestTimeDiff = timeDiff
            bestMatch = crashId
          }
        }

        // If we found a match within a reasonable time frame (e.g., 5 minutes)
        if (bestMatch && smallestTimeDiff < 5 * 60 * 1000) {
          updateCount++
          console.log(
            `Updating transaction ${transaction._id}: ${currentGameId} -> ${bestMatch} (time diff: ${smallestTimeDiff / 1000}s)`,
          )

          await Payment.updateOne({ _id: transaction._id }, { "gameDetails.gameId": bestMatch })
        }
      }
    }

    console.log(`Completed synchronization. Updated ${updateCount} transactions.`)
  } catch (error) {
    console.error("Error synchronizing game IDs:", error)
  } finally {
    mongoose.disconnect()
    console.log("Database connection closed")
  }
}

// Run the sync function
syncGameIds()

