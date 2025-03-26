const { v4: uuidv4 } = require("uuid")
// const CrashHistory = require("./models/crash-history")
const CrashHistory = require("../models/crash-history")
const Payment = require("../models/Payment")

/**
 * Game Service - Handles game state and data tracking
 */
class GameService {
  constructor() {
    this.currentGameId = null
    this.gameState = {
      status: "waiting", // waiting, active, crashed
      countdown: 5,
      multiplier: 1.0,
      activeBets: [],
      cashedOut: [],
      lastCrashes: [],
    }
  }

  /**
   * Initialize a new game with a unique gameId
   * @returns {string} The generated gameId
   */
  initializeGame() {
    // Generate a unique gameId using UUID
    this.currentGameId = uuidv4()

    // Reset game state
    this.gameState.status = "waiting"
    this.gameState.countdown = 5
    this.gameState.multiplier = 1.0
    this.gameState.activeBets = []
    this.gameState.cashedOut = []

    console.log(`New game initialized with ID: ${this.currentGameId}`)

    return this.currentGameId
  }

  /**
   * Record a bet in the payments collection
   * @param {Object} betData - Bet information
   * @returns {Promise<Object>} The saved payment record
   */
  async recordBet(betData) {
    try {
      // Create a payment record for the bet
      const payment = new Payment({
        userId: betData.userId,
        userName: betData.userName || "Anonymous",
        amount: -betData.amount, // Store as negative since it's a deduction
        status: "confirmed",
        transactionType: "game_loss", // Initially mark as loss, will update if they win
        gameDetails: {
          betAmount: betData.amount,
          multiplier: 0, // Will be updated if they cash out
          result: "pending",
          gameId: this.currentGameId,
        },
      })

      // Save the payment record
      await payment.save()
      console.log(`Bet recorded for game ${this.currentGameId} by user ${betData.userId}`)

      return payment
    } catch (error) {
      console.error("Error recording bet:", error)
      throw error
    }
  }

  /**
   * Record a cashout in the payments collection
   * @param {Object} cashoutData - Cashout information
   * @returns {Promise<Object>} The updated payment record
   */
  async recordCashout(cashoutData) {
    try {
      // Find the original bet payment
      const originalBet = await Payment.findOne({
        "gameDetails.gameId": this.currentGameId,
        userId: cashoutData.userId,
        transactionType: "game_loss",
      })

      if (!originalBet) {
        throw new Error("Original bet not found")
      }

      // Calculate winnings
      const betAmount = originalBet.gameDetails.betAmount
      const winAmount = betAmount * cashoutData.multiplier
      const profit = winAmount - betAmount

      // Create a win transaction
      const winPayment = new Payment({
        userId: cashoutData.userId,
        userName: cashoutData.userName || originalBet.userName || "Anonymous",
        amount: winAmount, // Store the full win amount as positive
        status: "confirmed",
        transactionType: "game_win",
        gameDetails: {
          betAmount: betAmount,
          multiplier: cashoutData.multiplier,
          result: "win",
          gameId: this.currentGameId,
          crashPoint: this.gameState.multiplier, // Current multiplier at time of cashout
        },
      })

      // Save the win transaction
      await winPayment.save()

      // Update the original bet record to reflect the cashout
      originalBet.gameDetails.multiplier = cashoutData.multiplier
      originalBet.gameDetails.result = "cashed_out"
      await originalBet.save()

      console.log(
        `Cashout recorded for game ${this.currentGameId} by user ${cashoutData.userId} at ${cashoutData.multiplier}x`,
      )

      return winPayment
    } catch (error) {
      console.error("Error recording cashout:", error)
      throw error
    }
  }

  /**
   * Record the game result in crash history
   * @param {number} crashPoint - The final multiplier when the game crashed
   * @param {boolean} isAdminSet - Whether the crash point was set by an admin
   * @returns {Promise<Object>} The saved crash history record
   */
  async recordGameEnd(crashPoint, isAdminSet = false) {
    try {
      // Create crash history record
      const crashHistory = new CrashHistory({
        crashPoint: crashPoint,
        gameId: this.currentGameId,
        isAdminSet: isAdminSet,
        timestamp: new Date(),
      })

      // Save crash history
      await crashHistory.save()

      // Update all active bets as lost (those who didn't cash out)
      await Payment.updateMany(
        {
          "gameDetails.gameId": this.currentGameId,
          "gameDetails.result": "pending",
        },
        {
          $set: {
            "gameDetails.result": "lost",
            "gameDetails.crashPoint": crashPoint,
          },
        },
      )

      console.log(`Game ${this.currentGameId} ended with crash point ${crashPoint}x`)

      return crashHistory
    } catch (error) {
      console.error("Error recording game end:", error)
      throw error
    }
  }

  /**
   * Get aggregated statistics for a specific game
   * @param {string} gameId - The game ID to get statistics for
   * @returns {Promise<Object>} Game statistics
   */
  async getGameStatistics(gameId) {
    try {
      // Get the crash history for this game
      const crashHistory = await CrashHistory.findOne({ gameId })

      if (!crashHistory) {
        return {
          error: true,
          message: "Game not found",
        }
      }

      // Get all bets for this game
      const bets = await Payment.find({
        "gameDetails.gameId": gameId,
        transactionType: { $in: ["game_win", "game_loss"] },
      })

      // Calculate statistics
      let totalBetAmount = 0
      let totalWinAmount = 0
      const uniquePlayerIds = new Set()

      bets.forEach((bet) => {
        if (bet.userId) {
          uniquePlayerIds.add(bet.userId.toString())
        }

        if (bet.transactionType === "game_loss") {
          totalBetAmount += Math.abs(bet.gameDetails?.betAmount || 0)
        } else if (bet.transactionType === "game_win") {
          totalWinAmount += Math.abs(bet.amount || 0)
        }
      })

      return {
        gameId,
        crashPoint: crashHistory.crashPoint,
        isAdminSet: crashHistory.isAdminSet,
        timestamp: crashHistory.timestamp,
        playerCount: uniquePlayerIds.size,
        totalBets: bets.length,
        totalBetAmount,
        totalWinAmount,
        adminProfit: totalBetAmount - totalWinAmount,
        bets: bets.map((bet) => ({
          userId: bet.userId,
          username: bet.userName || "Anonymous",
          betAmount: bet.gameDetails?.betAmount || 0,
          winAmount: bet.transactionType === "game_win" ? Math.abs(bet.amount) : 0,
          status: bet.transactionType === "game_win" ? "won" : "lost",
          cashoutMultiplier: bet.gameDetails?.multiplier || 1.0,
        })),
      }
    } catch (error) {
      console.error("Error getting game statistics:", error)
      throw error
    }
  }

  /**
   * Get aggregated statistics across all games
   * @param {Object} options - Query options (timeFrame, etc.)
   * @returns {Promise<Object>} Aggregated statistics
   */
  async getAggregateStatistics(options = {}) {
    try {
      const { timeFrame } = options
      let startDate = new Date(0) // Default to beginning of time

      // Set the appropriate start date based on the time frame
      if (timeFrame) {
        const now = new Date()
        switch (timeFrame) {
          case "hour":
            startDate = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
            break
          case "today":
            startDate = new Date(now.setHours(0, 0, 0, 0)) // Start of today
            break
          case "week":
            startDate = new Date(now.setDate(now.getDate() - now.getDay())) // Start of week
            startDate.setHours(0, 0, 0, 0)
            break
          case "month":
            startDate = new Date(now.setDate(1)) // Start of month
            startDate.setHours(0, 0, 0, 0)
            break
          // "all" is default (startDate = new Date(0))
        }
      }

      // Get all game transactions within the time frame
      const gameBets = await Payment.find({
        transactionType: { $in: ["game_win", "game_loss"] },
        createdAt: { $gte: startDate },
      })

      if (!gameBets || gameBets.length === 0) {
        return {
          totalUsers: 0,
          totalBets: 0,
          winUsers: 0,
          winAmount: 0,
          lossUsers: 0,
          lossAmount: 0,
          adminProfit: 0,
          isProfit: true,
          timeFrame: timeFrame || "all",
        }
      }

      // Calculate statistics
      const uniqueUserIds = new Set()
      const winUserIds = new Set()
      const lossUserIds = new Set()

      let totalWinAmount = 0
      let totalLossAmount = 0

      // Process each bet
      gameBets.forEach((bet) => {
        const userId = bet.userId ? bet.userId.toString() : "anonymous"
        uniqueUserIds.add(userId)

        if (bet.transactionType === "game_win") {
          winUserIds.add(userId)
          totalWinAmount += Math.abs(bet.amount || 0)
        } else if (bet.transactionType === "game_loss") {
          lossUserIds.add(userId)
          totalLossAmount += bet.gameDetails?.betAmount || 0
        }
      })

      // Calculate admin profit
      const adminProfit = totalLossAmount - totalWinAmount

      return {
        totalUsers: uniqueUserIds.size,
        totalBets: gameBets.length,
        winUsers: winUserIds.size,
        winAmount: totalWinAmount,
        lossUsers: lossUserIds.size,
        lossAmount: totalLossAmount,
        adminProfit: adminProfit,
        isProfit: adminProfit >= 0,
        timeFrame: timeFrame || "all",
      }
    } catch (error) {
      console.error("Error getting aggregate statistics:", error)
      throw error
    }
  }
}

module.exports = new GameService()

