// Create a new file: gameController.js
// This will handle game-related API endpoints

const express = require("express")
const router = express.Router()
const gameService = require("./gameService")
const CrashHistory = require("../models/crash-history")
const Payment = require("../models/Payment")

// Start a new game
router.post("/game/start", async (req, res) => {
  try {
    const { crashPoint, isAdminSet } = req.body

    if (!crashPoint || crashPoint < 1.01) {
      return res.status(400).json({ message: "Valid crash point is required (min 1.01)" })
    }

    const game = await gameService.createCrashGame(crashPoint, isAdminSet || false)

    res.status(201).json({
      message: "Game created successfully",
      game,
    })
  } catch (error) {
    console.error("Error starting game:", error)
    res.status(500).json({ message: "Error starting game", error: error.message })
  }
})

// Record a bet
router.post("/game/bet", async (req, res) => {
  try {
    const { userId, userName, gameId, betAmount, isWin, winAmount, cashoutMultiplier } = req.body

    if (!userId || !gameId || !betAmount) {
      return res.status(400).json({ message: "userId, gameId, and betAmount are required" })
    }

    const bet = await gameService.recordGameBet(
      userId, 
      userName || "Anonymous", 
      gameId, 
      betAmount, 
      isWin || false, 
      winAmount || 0, 
      cashoutMultiplier || 1.,
      betAmount, 
      isWin || false, 
      winAmount || 0, 
      cashoutMultiplier || 1.0
    )

    res.status(201).json({
      message: "Bet recorded successfully",
      bet,
    })
  } catch (error) {
    console.error("Error recording bet:", error)
    res.status(500).json({ message: "Error recording bet", error: error.message })
  }
})

// Get game statistics
router.get("/game/stats/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params

    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" })
    }

    const stats = await gameService.getGameStats(gameId)

    if (!stats.found) {
      return res.status(404).json({ message: "Game not found" })
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error("Error getting game stats:", error)
    res.status(500).json({ message: "Error getting game stats", error: error.message })
  }
})

// Sync all game IDs
router.post("/game/sync-ids", async (req, res) => {
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

    res.status(200).json({
      message: `Game ID synchronization completed. Updated ${updateCount} transactions.`,
      updatedCount: updateCount,
      totalTransactions: gameTransactions.length,
    })
  } catch (error) {
    console.error("Error syncing game IDs:", error)
    res.status(500).json({ message: "Error syncing game IDs", error: error.message })
  }
})

module.exports = router

