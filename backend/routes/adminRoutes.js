const express = require("express")
const router = express.Router()
const bcrypt = require("bcrypt")
const Admin = require("../models/admin")
const AdminCrash = require("../models/admin-crash")
const AdminCrashSequence = require("../models/admin-crash-sequence")
const CrashHistory = require("../models/crash-history")
const Payment = require("../models/Payment") // Changed from Bet to Payment

// Middleware to check if admin password is set
const checkAdminExists = async (req, res, next) => {
  try {
    const adminCount = await Admin.countDocuments()
    if (adminCount === 0) {
      // Create default admin if none exists
      const defaultAdmin = new Admin({
        userId: "000000000000000000000000", // Default admin ID
        password: "admin123", // Default password (will be hashed by pre-save hook)
      })
      await defaultAdmin.save()
    }
    next()
  } catch (error) {
    console.error("Admin check error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Admin login
router.post("/admin/login", checkAdminExists, async (req, res) => {
  try {
    const { password } = req.body

    if (!password) {
      return res.status(400).json({ message: "Password is required" })
    }

    // Get the first admin (we only need one for this simple implementation)
    const admin = await Admin.findOne()

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" })
    }

    const isMatch = await admin.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" })
    }

    // Update last login time
    admin.lastLogin = Date.now()
    await admin.save()

    res.status(200).json({ message: "Login successful" })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Check if user is admin
router.get("/admin/check/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" })
    }

    const admin = await Admin.findOne({ userId })

    res.status(200).json({ isAdmin: !!admin })
  } catch (error) {
    console.error("Admin check error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Set crash value for next game
router.post("/admin/set-crash", async (req, res) => {
  try {
    const { crashValue } = req.body

    if (!crashValue || crashValue < 1.01) {
      return res.status(400).json({ message: "Valid crash value is required (min 1.01)" })
    }

    // Check if there's already an unused admin crash value
    const existingCrash = await AdminCrash.findOne({ isUsed: false })

    if (existingCrash) {
      // Update existing unused crash value
      existingCrash.crashValue = crashValue
      existingCrash.createdAt = Date.now()
      await existingCrash.save()

      return res.status(200).json({
        message: "Crash value updated successfully",
        crashValue: existingCrash.crashValue,
      })
    }

    // Create new admin crash value
    const adminCrash = new AdminCrash({
      crashValue,
      isUsed: false,
    })

    await adminCrash.save()

    res.status(201).json({
      message: "Crash value set successfully",
      crashValue: adminCrash.crashValue,
    })
  } catch (error) {
    console.error("Set crash error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crash history
router.get("/admin/crash-history", async (req, res) => {
  try {
    const crashHistory = await CrashHistory.find().sort({ timestamp: -1 }).limit(50)

    res.status(200).json(crashHistory)
  } catch (error) {
    console.error("Get crash history error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// NEW: Set crash sequence for multiple games
router.post("/admin/set-crash-sequence", async (req, res) => {
  try {
    const { crashValues } = req.body

    if (!crashValues || !Array.isArray(crashValues) || crashValues.length === 0) {
      return res.status(400).json({ message: "Valid crash values array is required" })
    }

    // Validate all values
    for (const value of crashValues) {
      if (value < 1.01) {
        return res.status(400).json({
          message: `Invalid crash value: ${value}. All values must be at least 1.01`,
        })
      }
    }

    // Check if there's already an active crash sequence
    const existingSequence = await AdminCrashSequence.findOne({ isActive: true })

    if (existingSequence) {
      // Update existing sequence
      existingSequence.crashValues = crashValues
      existingSequence.currentIndex = 0 // Reset to start of sequence
      await existingSequence.save()

      return res.status(200).json({
        message: "Crash sequence updated successfully",
        crashValues: existingSequence.crashValues,
      })
    }

    // Create new crash sequence
    const crashSequence = new AdminCrashSequence({
      crashValues,
      currentIndex: 0,
      isActive: true,
    })

    await crashSequence.save()

    // Deactivate any single crash values for clarity
    await AdminCrash.updateMany({}, { isUsed: true })

    res.status(201).json({
      message: "Crash sequence set successfully",
      crashValues: crashSequence.crashValues,
    })
  } catch (error) {
    console.error("Set crash sequence error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get current crash sequence
router.get("/admin/crash-sequence", async (req, res) => {
  try {
    const crashSequence = await AdminCrashSequence.findOne({ isActive: true })

    if (!crashSequence) {
      return res.status(404).json({ message: "No active crash sequence found" })
    }

    res.status(200).json({
      crashValues: crashSequence.crashValues,
      currentIndex: crashSequence.currentIndex,
    })
  } catch (error) {
    console.error("Get crash sequence error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Deactivate crash sequence
router.post("/admin/deactivate-crash-sequence", async (req, res) => {
  try {
    const result = await AdminCrashSequence.updateMany({}, { isActive: false })

    res.status(200).json({
      message: "Crash sequence deactivated",
      count: result.modifiedCount,
    })
  } catch (error) {
    console.error("Deactivate crash sequence error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get bet statistics for admin panel with time filtering
router.get("/admin/bet-stats", async (req, res) => {
  try {
    const { timeFrame } = req.query
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
          startDate = new Date(now.setDate(now.getDate() - now.getDay())) // Start of week (Sunday)
          startDate.setHours(0, 0, 0, 0)
          break
        case "month":
          startDate = new Date(now.setDate(1)) // Start of month
          startDate.setHours(0, 0, 0, 0)
          break
        // "all" is default (startDate = new Date(0))
      }
    }

    // Get all game transactions (wins and losses) within the time frame
    const gameBets = await Payment.find({
      transactionType: { $in: ["game_win", "game_loss"] },
      createdAt: { $gte: startDate },
    })

    if (!gameBets || gameBets.length === 0) {
      return res.status(200).json({
        totalUsers: 0,
        totalBets: 0,
        winUsers: 0,
        winAmount: 0,
        lossUsers: 0,
        lossAmount: 0,
        adminProfit: 0,
        isProfit: true,
        timeFrame: timeFrame || "all",
      })
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

    // Calculate admin profit (loss amount - win amount)
    const adminProfit = totalLossAmount - totalWinAmount

    const stats = {
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

    res.status(200).json(stats)
  } catch (error) {
    console.error("Error calculating bet statistics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add more detailed debug logs to the user-bets endpoint
router.get("/admin/user-bets", async (req, res) => {
  try {
    const { timeFrame, page = 1, limit = 50 } = req.query
    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

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
          startDate = new Date(now.setDate(now.getDate() - now.getDay())) // Start of week (Sunday)
          startDate.setHours(0, 0, 0, 0)
          break
        case "month":
          startDate = new Date(now.setDate(1)) // Start of month
          startDate.setHours(0, 0, 0, 0)
          break
        // "all" is default (startDate = new Date(0))
      }
    }

    console.log(`Fetching bets with timeFrame: ${timeFrame}, startDate: ${startDate}`)

    // Get the total count for pagination
    const totalCount = await Payment.countDocuments({
      transactionType: { $in: ["game_win", "game_loss"] },
      createdAt: { $gte: startDate },
    })

    console.log(`Total count of bets: ${totalCount}`)

    // Get the game transactions with pagination
    const gameBets = await Payment.find({
      transactionType: { $in: ["game_win", "game_loss"] },
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    console.log(`Found ${gameBets.length} bets for the current page`)

    if (!gameBets || gameBets.length === 0) {
      console.log("No bets found, returning empty array")
      return res.status(200).json({
        bets: [],
        pagination: {
          total: 0,
          page: pageNum,
          limit: limitNum,
          pages: 0,
        },
        timeFrame: timeFrame || "all",
      })
    }

    // Format the bets for the frontend
    const formattedBets = gameBets.map((bet) => {
      const isWin = bet.transactionType === "game_win"

      // Log each bet for debugging
      console.log(
        `Processing bet: userId=${bet.userId}, userName=${bet.userName}, amount=${bet.amount}, gameDetails=`,
        bet.gameDetails,
      )

      // Add this validation and conversion code:
      let gameId = bet.gameDetails?.gameId || "unknown"

      // Ensure gameId is in UUID format
      if (gameId && (gameId.startsWith("game-") || !gameId.includes("-"))) {
        console.log(`Converting non-standard gameId format: ${gameId}`)
        // Try to extract UUID if it's embedded in the string
        const uuidMatch = gameId.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
        if (uuidMatch) {
          gameId = uuidMatch[1]
          console.log(`Extracted UUID: ${gameId}`)
        }
      }

      return {
        _id: bet._id,
        userId: bet.userId,
        username: bet.userName || "Anonymous",
        amount: bet.gameDetails?.betAmount || 0,
        profit: isWin ? Math.abs(bet.amount) : 0,
        status: isWin ? "won" : "lost",
        cashoutMultiplier: bet.gameDetails?.multiplier || 1.0,
        createdAt: bet.createdAt || new Date(),
        gameId: gameId,
        crashPoint: bet.gameDetails?.crashPoint || (isWin ? bet.gameDetails?.multiplier : 1.0),
      }
    })

    console.log(`Returning ${formattedBets.length} formatted bets`)

    res.status(200).json({
      bets: formattedBets,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
      timeFrame: timeFrame || "all",
    })
  } catch (error) {
    console.error("Error fetching user bets:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get detailed game statistics by game ID
router.get("/admin/game-stats/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params

    if (!gameId) {
      return res.status(400).json({ message: "Game ID is required" })
    }

    // Get the crash point for this game
    const crashHistory = await CrashHistory.findOne({ gameId })

    // Get all bets for this game
    let gameBets = []
    try {
      // First try exact match
      gameBets = await Payment.find({
        "gameDetails.gameId": gameId,
        transactionType: { $in: ["game_win", "game_loss"] },
      }).lean()

      console.log(`Found ${gameBets.length} bets with exact gameId match for game ${gameId}`)

      // If no results, try matching with UUID pattern extraction
      if (gameBets.length === 0) {
        console.log(`Trying UUID pattern matching for gameId: ${gameId}`)

        // Get all game transactions
        const allGameBets = await Payment.find({
          transactionType: { $in: ["game_win", "game_loss"] },
          "gameDetails.gameId": { $exists: true },
        }).lean()

        // Filter manually to find matches based on UUID pattern
        gameBets = allGameBets.filter((bet) => {
          if (!bet.gameDetails?.gameId) return false

          // Check if either contains the other
          if (bet.gameDetails.gameId.includes(gameId) || gameId.includes(bet.gameDetails.gameId)) {
            return true
          }

          // Extract UUID pattern if present in both
          const gameIdUuidMatch = gameId.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
          const betGameIdUuidMatch = bet.gameDetails.gameId.match(
            /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
          )

          if (gameIdUuidMatch && betGameIdUuidMatch) {
            return gameIdUuidMatch[1] === betGameIdUuidMatch[1]
          }

          return false
        })

        console.log(`Found ${gameBets.length} bets with UUID pattern matching`)
      }
    } catch (error) {
      console.error(`Error finding bets for game ${gameId}:`, error)
    }

    if (!gameBets || gameBets.length === 0) {
      return res.status(200).json({
        gameId,
        crashPoint: crashHistory?.crashPoint || "Unknown",
        isAdminSet: crashHistory?.isAdminSet || false,
        timestamp: crashHistory?.timestamp || null,
        totalBets: 0,
        totalBetAmount: 0,
        totalWinAmount: 0,
        adminProfit: 0,
        bets: [],
      })
    }

    let totalBetAmount = 0
    let totalWinAmount = 0

    // Format the bets and calculate totals
    const formattedBets = gameBets.map((bet) => {
      const isWin = bet.transactionType === "game_win"

      // Log each bet for debugging
      console.log(
        `Processing bet: userId=${bet.userId}, userName=${bet.userName}, transactionType=${bet.transactionType}, amount=${bet.amount}, gameDetails=`,
        bet.gameDetails,
      )

      let betAmount = 0
      let winAmount = 0

      // For game_win transactions
      if (isWin) {
        winAmount = Math.abs(bet.amount || 0)
        // Use gameDetails.betAmount if available, otherwise try to derive from profit
        betAmount = bet.gameDetails?.betAmount || winAmount / (bet.gameDetails?.multiplier || 1)
      }
      // For game_loss transactions
      else {
        // For losses, the bet amount is in gameDetails.betAmount
        betAmount = bet.gameDetails?.betAmount || 0
      }

      totalBetAmount += betAmount
      totalWinAmount += winAmount

      return {
        userId: bet.userId,
        username: bet.userName || "Anonymous",
        betAmount,
        winAmount,
        profit: winAmount - betAmount,
        status: isWin ? "won" : "lost",
        cashoutMultiplier: bet.gameDetails?.multiplier || 1.0,
        timestamp: bet.createdAt,
      }
    })

    const adminProfit = totalBetAmount - totalWinAmount

    res.status(200).json({
      gameId,
      crashPoint: crashHistory?.crashPoint || "Unknown",
      isAdminSet: crashHistory?.isAdminSet || false,
      timestamp: crashHistory?.timestamp || null,
      totalBets: gameBets.length,
      totalBetAmount,
      totalWinAmount,
      adminProfit,
      bets: formattedBets,
    })
  } catch (error) {
    console.error("Error fetching game statistics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Also add more detailed debug logs to the games endpoint
router.get("/admin/games", async (req, res) => {
  try {
    const { timeFrame, page = 1, limit = 20 } = req.query
    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

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
          startDate = new Date(now.setDate(now.getDate() - now.getDay())) // Start of week (Sunday)
          startDate.setHours(0, 0, 0, 0)
          break
        case "month":
          startDate = new Date(now.setDate(1)) // Start of month
          startDate.setHours(0, 0, 0, 0)
          break
        // "all" is default (startDate = new Date(0))
      }
    }

    console.log(`Fetching games with timeFrame: ${timeFrame}, startDate: ${startDate}`)

    // Get total count for pagination
    const totalCount = await CrashHistory.countDocuments({
      timestamp: { $gte: startDate },
    })

    console.log(`Total count of games: ${totalCount}`)

    // Get crash history with pagination
    const games = await CrashHistory.find({
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()

    console.log(`Found ${games.length} games for the current page`)

    // For each game, get basic stats
    const gamesWithStats = await Promise.all(
      games.map(async (game) => {
        console.log(`Processing game with ID: ${game.gameId}`)

        // Get all bets for this game - FIXED QUERY
        let gameBets = []
        try {
          // First try exact match
          gameBets = await Payment.find({
            "gameDetails.gameId": game.gameId,
            transactionType: { $in: ["game_win", "game_loss"] },
          }).lean()

          console.log(`Found ${gameBets.length} bets with exact gameId match for game ${game.gameId}`)

          // If no results, try matching with UUID pattern extraction
          if (gameBets.length === 0) {
            console.log(`Trying UUID pattern matching for gameId: ${game.gameId}`)

            // Get all game transactions
            const allGameBets = await Payment.find({
              transactionType: { $in: ["game_win", "game_loss"] },
              "gameDetails.gameId": { $exists: true },
            }).lean()

            // Filter manually to find matches based on UUID pattern
            gameBets = allGameBets.filter((bet) => {
              if (!bet.gameDetails?.gameId) return false

              // Check if either contains the other
              if (bet.gameDetails.gameId.includes(game.gameId) || game.gameId.includes(bet.gameDetails.gameId)) {
                return true
              }

              // Extract UUID pattern if present in both
              const gameIdUuidMatch = game.gameId.match(
                /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
              )
              const betGameIdUuidMatch = bet.gameDetails.gameId.match(
                /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
              )

              if (gameIdUuidMatch && betGameIdUuidMatch) {
                return gameIdUuidMatch[1] === betGameIdUuidMatch[1]
              }

              return false
            })

            console.log(`Found ${gameBets.length} bets with UUID pattern matching`)
          }
        } catch (error) {
          console.error(`Error finding bets for game ${game.gameId}:`, error)
        }

        console.log(`Found ${gameBets.length} bets for game ${game.gameId}`)

        // If no bets found, try a more flexible query
        if (gameBets.length === 0) {
          console.log(`No bets found with exact gameId match, trying partial match...`)
          // Try a more flexible query with regex
          const flexibleBets = await Payment.find({
            transactionType: { $in: ["game_win", "game_loss"] },
          }).lean()

          // Filter manually to find any potential matches
          const possibleMatches = flexibleBets.filter((bet) => {
            if (!bet.gameDetails || !bet.gameDetails.gameId) return false
            return bet.gameDetails.gameId.includes(game.gameId) || game.gameId.includes(bet.gameDetails.gameId)
          })

          console.log(`Found ${possibleMatches.length} potential matches with flexible search`)

          if (possibleMatches.length > 0) {
            console.log(
              `Game IDs in payments:`,
              possibleMatches.map((b) => b.gameDetails?.gameId),
            )
          }
        }

        let totalBetAmount = 0
        let totalWinAmount = 0
        let playerCount = 0

        if (gameBets && gameBets.length > 0) {
          const uniquePlayerIds = new Set()

          gameBets.forEach((bet) => {
            if (bet.userId) uniquePlayerIds.add(bet.userId.toString())

            const isWin = bet.transactionType === "game_win"
            // Log each bet for debugging
            console.log(
              `Bet: userId=${bet.userId}, userName=${bet.userName}, transactionType=${bet.transactionType}, amount=${bet.amount}, gameDetails=`,
              bet.gameDetails,
            )

            // For game_win transactions
            if (isWin) {
              totalWinAmount += Math.abs(bet.amount || 0)
              // Use gameDetails.betAmount if available, otherwise try to derive from profit
              const betAmount = bet.gameDetails?.betAmount || Math.abs(bet.amount) / (bet.gameDetails?.multiplier || 1)
              totalBetAmount += betAmount
            }
            // For game_loss transactions
            else {
              // For losses, the bet amount is in gameDetails.betAmount
              totalBetAmount += bet.gameDetails?.betAmount || 0
            }
          })

          playerCount = uniquePlayerIds.size
        }

        console.log(
          `Game ${game.gameId}: playerCount=${playerCount}, totalBetAmount=${totalBetAmount}, totalWinAmount=${totalWinAmount}`,
        )

        return {
          gameId: game.gameId,
          crashPoint: game.crashPoint,
          isAdminSet: game.isAdminSet || false,
          timestamp: game.timestamp,
          playerCount,
          totalBetAmount,
          totalWinAmount,
          adminProfit: totalBetAmount - totalWinAmount,
        }
      }),
    )

    console.log(`Returning ${gamesWithStats.length} games with stats`)

    res.status(200).json({
      games: gamesWithStats,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
      timeFrame: timeFrame || "all",
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Change admin password
router.post("/admin/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new passwords are required" })
    }

    const admin = await Admin.findOne()

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" })
    }

    const isMatch = await admin.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    admin.password = newPassword
    await admin.save()

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

