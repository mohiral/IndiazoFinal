// This is a utility script you can run to sync existing game IDs
// You can run this once to fix existing data

const mongoose = require("mongoose")
const Payment = require("../models/Payment")
const CrashHistory = require("../models/crash-history")

// Connect to your MongoDB (replace with your connection string)
mongoose.connect("mongodb://localhost:27017/your_database_name", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

async function syncGameIds() {
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

      // Also map variations of the ID
      if (crash.gameId.startsWith("game-")) {
        crashHistoryMap.set(crash.gameId.substring(5), crash)
      } else {
        crashHistoryMap.set(`game-${crash.gameId}`, crash)
      }
    })

    // Count of updates needed
    let updateCount = 0

    // Process each game transaction
    for (const transaction of gameTransactions) {
      const currentGameId = transaction.gameDetails.gameId

      // Skip if no game ID
      if (!currentGameId) continue

      // Check if this transaction's game ID needs normalization
      let needsUpdate = false
      let normalizedGameId = currentGameId

      // If the current ID doesn't match any crash history record directly
      if (!crashHistoryMap.has(currentGameId)) {
        // Try to find a matching crash history
        let matchFound = false

        // Try with/without "game-" prefix
        const alternateId = currentGameId.startsWith("game-") ? currentGameId.substring(5) : `game-${currentGameId}`

        if (crashHistoryMap.has(alternateId)) {
          normalizedGameId = alternateId
          matchFound = true
        }

        // If still no match, try partial matching
        if (!matchFound) {
          for (const [crashId, crash] of crashHistoryMap.entries()) {
            if (
              (currentGameId.includes(crashId) || crashId.includes(currentGameId)) &&
              currentGameId.length > 5 &&
              crashId.length > 5 // Avoid matching very short IDs
            ) {
              normalizedGameId = crashId
              matchFound = true
              break
            }
          }
        }

        needsUpdate = matchFound
      }

      // Update if needed
      if (needsUpdate) {
        updateCount++
        console.log(`Updating transaction ${transaction._id}: ${currentGameId} -> ${normalizedGameId}`)

        await Payment.updateOne({ _id: transaction._id }, { "gameDetails.gameId": normalizedGameId })
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

