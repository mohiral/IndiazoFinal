// Create a new file: gameService.js
// This will be a central service for game-related operations

const CrashHistory = require("../models/crash-history")
const Payment = require("../models/Payment")

// Generate a consistent game ID format
const generateGameId = () => {
  // Use timestamp to ensure uniqueness
  const timestamp = Date.now()
  return `game-${timestamp}`
}

// Ensure game IDs are consistent between crash history and payments
const normalizeGameId = async (gameId) => {
  if (!gameId) return "unknown"

  // If it's already in the correct format, return it
  const crashGame = await CrashHistory.findOne({ gameId }).lean()
  if (crashGame) return gameId

  // Try with "game-" prefix
  if (!gameId.startsWith("game-")) {
    const prefixedId = `game-${gameId}`
    const crashGameWithPrefix = await CrashHistory.findOne({ gameId: prefixedId }).lean()
    if (crashGameWithPrefix) return prefixedId
  }

  // Try without "game-" prefix
  if (gameId.startsWith("game-")) {
    const unprefixedId = gameId.substring(5)
    const crashGameWithoutPrefix = await CrashHistory.findOne({ gameId: unprefixedId }).lean()
    if (crashGameWithoutPrefix) return unprefixedId
  }

  // If no match found in crash history, use the original format
  // But ensure it's consistent with how new crash games are created
  return gameId.startsWith("game-") ? gameId : `game-${gameId}`
}

// Create a new crash game record
const createCrashGame = async (crashPoint, isAdminSet = false) => {
  const gameId = generateGameId()

  const crashGame = new CrashHistory({
    gameId,
    crashPoint,
    isAdminSet,
    timestamp: new Date(),
  })

  await crashGame.save()
  return crashGame
}

// Record a bet for a game
const recordGameBet = async (userId, userName, gameId, betAmount, isWin, winAmount, cashoutMultiplier) => {
  // Ensure the gameId is normalized
  const normalizedGameId = await normalizeGameId(gameId)

  const gameTransaction = new Payment({
    userId,
    userName,
    amount: isWin ? winAmount : -betAmount, // Positive for win, negative for loss
    status: "confirmed", // Auto-confirm game transactions
    transactionType: isWin ? "game_win" : "game_loss",
    gameDetails: {
      betAmount,
      multiplier: isWin ? cashoutMultiplier : 0,
      result: isWin ? "win" : "loss",
      gameId: normalizedGameId,
    },
  })

  await gameTransaction.save()
  return gameTransaction
}

// Get game statistics
const getGameStats = async (gameId) => {
  // Ensure the gameId is normalized
  const normalizedGameId = await normalizeGameId(gameId)

  // Get the crash game
  const crashGame = await CrashHistory.findOne({ gameId: normalizedGameId }).lean()

  if (!crashGame) {
    return {
      gameId: normalizedGameId,
      found: false,
      message: "Game not found",
    }
  }

  // Get all bets for this game
  const gameBets = await Payment.find({
    transactionType: { $in: ["game_win", "game_loss"] },
    "gameDetails.gameId": normalizedGameId,
  }).lean()

  // Calculate statistics
  let totalBetAmount = 0
  let totalWinAmount = 0
  const uniquePlayerIds = new Set()

  gameBets.forEach((bet) => {
    if (bet.userId) uniquePlayerIds.add(bet.userId.toString())

    const isWin = bet.transactionType === "game_win"

    if (isWin) {
      totalWinAmount += Math.abs(bet.amount || 0)
      const betAmount = bet.gameDetails?.betAmount || Math.abs(bet.amount) / (bet.gameDetails?.multiplier || 1)
      totalBetAmount += betAmount
    } else {
      totalBetAmount += bet.gameDetails?.betAmount || 0
    }
  })

  return {
    gameId: normalizedGameId,
    crashPoint: crashGame.crashPoint,
    isAdminSet: crashGame.isAdminSet || false,
    timestamp: crashGame.timestamp,
    playerCount: uniquePlayerIds.size,
    totalBets: gameBets.length,
    totalBetAmount,
    totalWinAmount,
    adminProfit: totalBetAmount - totalWinAmount,
    found: true,
  }
}

module.exports = {
  generateGameId,
  normalizeGameId,
  createCrashGame,
  recordGameBet,
  getGameStats,
}

