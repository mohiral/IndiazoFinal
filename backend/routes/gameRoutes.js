const express = require("express")
const router = express.Router()
const gameService = require("../services/gameService")

// Start a new game
router.post("/start-game", async (req, res) => {
  try {
    const { isAdminSet, crashPoint } = req.body

    const game = await gameService.startGame(isAdminSet, crashPoint)

    res.status(201).json({
      success: true,
      message: "Game started successfully",
      game: {
        gameId: game.gameId,
        startTime: game.startTime,
        status: game.status,
        isAdminSet: game.isAdminSet,
      },
    })
  } catch (error) {
    console.error("Error starting game:", error)
    res.status(500).json({
      success: false,
      message: "Failed to start game",
      error: error.message,
    })
  }
})

// Place a bet
router.post("/bet", async (req, res) => {
  try {
    const { userId, userName, gameId, amount, autoCashout } = req.body

    if (!userId || !gameId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, gameId, and amount are required",
      })
    }

    const result = await gameService.placeBet(userId, userName, gameId, amount, autoCashout)

    res.status(201).json({
      success: true,
      message: "Bet placed successfully",
      bet: result.bet,
    })
  } catch (error) {
    console.error("Error placing bet:", error)
    res.status(500).json({
      success: false,
      message: "Failed to place bet",
      error: error.message,
    })
  }
})

// Process a cashout
router.post("/cashout", async (req, res) => {
  try {
    const { userId, gameId, cashoutMultiplier } = req.body

    if (!userId || !gameId || !cashoutMultiplier) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, gameId, and cashoutMultiplier are required",
      })
    }

    const result = await gameService.processCashout(userId, gameId, cashoutMultiplier)

    res.status(200).json({
      success: true,
      message: "Cashout processed successfully",
      bet: result.bet,
      winAmount: result.winAmount,
    })
  } catch (error) {
    console.error("Error processing cashout:", error)
    res.status(500).json({
      success: false,
      message: "Failed to process cashout",
      error: error.message,
    })
  }
})

// End a game
router.post("/end-game", async (req, res) => {
  try {
    const { gameId, crashPoint } = req.body

    if (!gameId || !crashPoint) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: gameId and crashPoint are required",
      })
    }

    const result = await gameService.endGame(gameId, crashPoint)

    res.status(200).json({
      success: true,
      message: "Game ended successfully",
      game: result.game,
      crashHistory: result.crashHistory,
    })
  } catch (error) {
    console.error("Error ending game:", error)
    res.status(500).json({
      success: false,
      message: "Failed to end game",
      error: error.message,
    })
  }
})

// Get game report
router.get("/game-report/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: gameId",
      })
    }

    const report = await gameService.getGameReport(gameId)

    res.status(200).json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Error generating game report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate game report",
      error: error.message,
    })
  }
})

// Get aggregate statistics
router.get("/stats", async (req, res) => {
  try {
    const { timeFrame } = req.query

    const stats = await gameService.getAggregateStats(timeFrame || "all")

    res.status(200).json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error generating statistics:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate statistics",
      error: error.message,
    })
  }
})

module.exports = router

