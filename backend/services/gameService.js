const Game = require("../models/game")
const Bet = require("../models/bet")
const Payment = require("../models/Payment")
const CrashHistory = require("../models/crash-history")
const mongoose = require("mongoose")

// Start a new game and generate a unique gameId
const startGame = async (isAdminSet = false, predefinedCrashPoint = null) => {
  try {
    // Create a new game with a unique gameId
    const game = new Game({
      status: "active",
      isAdminSet: isAdminSet,
      crashPoint: predefinedCrashPoint, // This will be null for normal games
    })

    await game.save()

    console.log(`Game started with ID: ${game.gameId}`)
    return game
  } catch (error) {
    console.error("Error starting game:", error)
    throw error
  }
}

// Place a bet in an active game
const placeBet = async (userId, userName, gameId, amount, autoCashout = null) => {
  try {
    // Check if game exists and is active
    const game = await Game.findOne({ gameId, status: "active" })
    if (!game) {
      throw new Error("Game not found or not active")
    }

    // Create a new bet
    const bet = new Bet({
      userId,
      userName,
      gameId,
      amount,
      status: "active",
      isAutoCashout: !!autoCashout,
      autoCashoutAt: autoCashout,
    })

    await bet.save()

    // Create a payment record for the bet (deduct from user's balance)
    const payment = new Payment({
      userId,
      userName,
      amount: -amount, // Negative amount for deduction
      status: "confirmed",
      transactionType: "game_loss", // Initially marked as loss
      gameDetails: {
        gameId,
        betAmount: amount,
        result: "pending",
      },
    })

    await payment.save()

    console.log(`Bet placed: User ${userId} bet ${amount} on game ${gameId}`)
    return { bet, payment }
  } catch (error) {
    console.error("Error placing bet:", error)
    throw error
  }
}

// Process a cashout
const processCashout = async (userId, gameId, cashoutMultiplier) => {
  try {
    // Find the user's active bet for this game
    const bet = await Bet.findOne({
      userId,
      gameId,
      status: "active",
    })

    if (!bet) {
      throw new Error("No active bet found for this user in this game")
    }

    // Calculate win amount
    const winAmount = bet.amount * cashoutMultiplier

    // Update bet status to won
    bet.status = "won"
    bet.cashoutMultiplier = cashoutMultiplier
    bet.winAmount = winAmount
    await bet.save()

    // Find the original payment record and update it
    const originalPayment = await Payment.findOne({
      userId,
      "gameDetails.gameId": gameId,
      transactionType: "game_loss",
    })

    if (originalPayment) {
      // Update the original payment to reflect the win
      originalPayment.transactionType = "game_win"
      originalPayment.amount = winAmount
      originalPayment.gameDetails.result = "win"
      originalPayment.gameDetails.multiplier = cashoutMultiplier
      await originalPayment.save()
    } else {
      // Create a new payment record for the win
      const payment = new Payment({
        userId,
        userName: bet.userName,
        amount: winAmount,
        status: "confirmed",
        transactionType: "game_win",
        gameDetails: {
          gameId,
          betAmount: bet.amount,
          multiplier: cashoutMultiplier,
          result: "win",
        },
      })

      await payment.save()
    }

    console.log(`Cashout processed: User ${userId} won ${winAmount} at ${cashoutMultiplier}x on game ${gameId}`)
    return { bet, winAmount }
  } catch (error) {
    console.error("Error processing cashout:", error)
    throw error
  }
}

// End a game and process all remaining bets
const endGame = async (gameId, crashPoint) => {
  try {
    // Find the game
    const game = await Game.findOne({ gameId })
    if (!game) {
      throw new Error("Game not found")
    }

    // Update game status to completed
    game.status = "completed"
    game.endTime = new Date()
    game.crashPoint = crashPoint
    await game.save()

    // Create crash history record
    const crashHistory = new CrashHistory({
      gameId,
      crashPoint,
      isAdminSet: game.isAdminSet,
      timestamp: new Date(),
    })

    await crashHistory.save()

    // Process all active bets as lost
    const activeBets = await Bet.find({ gameId, status: "active" })

    // Process auto-cashouts
    for (const bet of activeBets) {
      if (bet.isAutoCashout && bet.autoCashoutAt && bet.autoCashoutAt <= crashPoint) {
        // Auto-cashout successful
        await processCashout(bet.userId, gameId, bet.autoCashoutAt)
      } else {
        // Bet lost
        bet.status = "lost"
        await bet.save()
      }
    }

    console.log(`Game ${gameId} ended with crash point ${crashPoint}. Processed ${activeBets.length} active bets.`)
    return { game, crashHistory }
  } catch (error) {
    console.error("Error ending game:", error)
    throw error
  }
}

// Get detailed game report
const getGameReport = async (gameId) => {
  try {
    // Get game and crash info
    const game = await Game.findOne({ gameId })
    if (!game) {
      throw new Error("Game not found")
    }

    const crashHistory = await CrashHistory.findOne({ gameId })

    // Aggregate bet data
    const bets = await Bet.find({ gameId })

    // Calculate statistics
    const totalBets = bets.length
    const totalPlayers = new Set(bets.map((bet) => bet.userId.toString())).size
    const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0)

    const wonBets = bets.filter((bet) => bet.status === "won")
    const totalWonAmount = wonBets.reduce((sum, bet) => sum + bet.winAmount, 0)

    const lostBets = bets.filter((bet) => bet.status === "lost")
    const totalLostAmount = lostBets.reduce((sum, bet) => sum + bet.amount, 0)

    // Calculate house profit/loss
    const houseProfit = totalBetAmount - totalWonAmount

    return {
      gameId,
      crashPoint: game.crashPoint,
      startTime: game.startTime,
      endTime: game.endTime,
      isAdminSet: game.isAdminSet,
      totalPlayers,
      totalBets,
      totalBetAmount,
      totalWonAmount,
      totalLostAmount,
      houseProfit,
      bets: bets.map((bet) => ({
        userId: bet.userId,
        userName: bet.userName,
        amount: bet.amount,
        status: bet.status,
        cashoutMultiplier: bet.cashoutMultiplier,
        winAmount: bet.winAmount,
        isAutoCashout: bet.isAutoCashout,
        autoCashoutAt: bet.autoCashoutAt,
      })),
    }
  } catch (error) {
    console.error("Error generating game report:", error)
    throw error
  }
}

// Get aggregate statistics for multiple games
const getAggregateStats = async (timeFrame = "all") => {
  try {
    let startDate = new Date(0) // Default to beginning of time

    // Set the appropriate start date based on the time frame
    if (timeFrame !== "all") {
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
      }
    }

    // Get all completed games in the time frame
    const games = await Game.find({
      status: "completed",
      endTime: { $gte: startDate },
    }).sort({ endTime: -1 })

    const gameIds = games.map((game) => game.gameId)

    // Get all bets for these games
    const bets = await Bet.find({ gameId: { $in: gameIds } })

    // Calculate statistics
    const totalGames = games.length
    const uniquePlayerIds = new Set()
    let totalBetAmount = 0
    let totalWonAmount = 0

    bets.forEach((bet) => {
      uniquePlayerIds.add(bet.userId.toString())
      totalBetAmount += bet.amount

      if (bet.status === "won") {
        totalWonAmount += bet.winAmount
      }
    })

    const totalPlayers = uniquePlayerIds.size
    const totalBets = bets.length
    const houseProfit = totalBetAmount - totalWonAmount

    // Find highest and average crash points
    const crashPoints = games.map((game) => game.crashPoint).filter(Boolean)
    const highestCrash = Math.max(...crashPoints, 0)
    const averageCrash =
      crashPoints.length > 0 ? crashPoints.reduce((sum, point) => sum + point, 0) / crashPoints.length : 0

    return {
      timeFrame,
      totalGames,
      totalPlayers,
      totalBets,
      totalBetAmount,
      totalWonAmount,
      houseProfit,
      highestCrash,
      averageCrash: Number.parseFloat(averageCrash.toFixed(2)),
      startDate,
      endDate: new Date(),
    }
  } catch (error) {
    console.error("Error generating aggregate stats:", error)
    throw error
  }
}

module.exports = {
  startGame,
  placeBet,
  processCashout,
  endGame,
  getGameReport,
  getAggregateStats,
}

