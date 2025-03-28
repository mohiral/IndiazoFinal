const socketIo = require("socket.io")
const gameIdManager = require("../utils/gameIdManager")
const CrashHistory = require("../models/crash-history")
const AdminCrash = require("../models/admin-crash")
const AdminCrashSequence = require("../models/admin-crash-sequence")

// Game state
const gameState = {
  status: "waiting", // waiting, active, crashed
  currentMultiplier: 1.0,
  activeBets: [],
  gameId: gameIdManager.getCurrentGameId(), // Initialize with current gameId
}

// Initialize socket server
const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    // Send current game state and ID to new connections
    socket.emit("game_state", {
      ...gameState,
      gameId: gameState.gameId,
    })

    // Handle bet placement
    socket.on("place_bet", (data) => {
      const { userId, amount } = data

      // Add bet to active bets with the current game ID
      const bet = {
        userId,
        amount,
        gameId: gameState.gameId,
        timestamp: Date.now(),
      }

      gameState.activeBets.push(bet)

      // Broadcast the new bet to all clients
      io.emit("new_bet", bet)

      // Confirm bet to the user who placed it
      socket.emit("bet_confirmed", bet)
    })

    // Handle game start
    socket.on("start_game", async () => {
      // Update game state
      gameState.status = "active"
      gameState.currentMultiplier = 1.0

      // Get the current game ID
      const gameId = gameState.gameId

      // Broadcast game start to all clients
      io.emit("game_started", { gameId })

      // Start increasing multiplier
      const multiplierInterval = setInterval(() => {
        gameState.currentMultiplier += 0.01
        io.emit("multiplier_update", gameState.currentMultiplier)
      }, 100)

      // Determine crash point - check for admin set values first
      let crashPoint
      let adminCrash = null // Declare adminCrash here

      // Check for active sequence
      const activeSequence = await AdminCrashSequence.findOne({ isActive: true })

      if (activeSequence && activeSequence.crashValues.length > 0) {
        // Use the next value in the sequence
        crashPoint = activeSequence.crashValues[activeSequence.currentIndex]

        // Update the index for next game
        activeSequence.currentIndex = (activeSequence.currentIndex + 1) % activeSequence.crashValues.length
        await activeSequence.save()

        console.log(`Using crash point from sequence: ${crashPoint} (index ${activeSequence.currentIndex - 1})`)
      } else {
        // Check for single admin-set crash value
        adminCrash = await AdminCrash.findOne({ isUsed: false })

        if (adminCrash) {
          crashPoint = adminCrash.crashValue
          adminCrash.isUsed = true
          adminCrash.usedAt = new Date()
          await adminCrash.save()

          console.log(`Using admin-set crash point: ${crashPoint}`)
        } else {
          // Generate random crash point
          crashPoint = 1.0 + Math.random() * 5 // Random between 1.0 and 6.0
          if (Math.random() < 0.1) {
            crashPoint = 1.0 + Math.random() * 20 // 10% chance for higher value
          }
          crashPoint = Math.round(crashPoint * 100) / 100 // Round to 2 decimal places

          console.log(`Using random crash point: ${crashPoint}`)
        }
      }

      // Calculate time until crash based on crash point
      const timeUntilCrash = (crashPoint - 1.0) * 1000 // 1 second per 1.0 multiplier

      // Set timeout for game end
      setTimeout(async () => {
        clearInterval(multiplierInterval)

        // Game crashed
        gameState.status = "crashed"
        io.emit("game_crashed", crashPoint)

        // Save crash history
        const crashHistory = new CrashHistory({
          crashPoint,
          gameId,
          isAdminSet: activeSequence || adminCrash ? true : false,
        })

        await crashHistory.save()

        // Reset for next game
        gameState.activeBets = []
        gameState.status = "waiting"

        // Update the game ID for the next game
        gameState.gameId = gameIdManager.updateGameId()
        console.log("New game ID generated:", gameState.gameId)

        // Start countdown for next game
        let countdown = 5
        const countdownInterval = setInterval(() => {
          io.emit("countdown", countdown)
          countdown--

          if (countdown < 0) {
            clearInterval(countdownInterval)
            // Start next game
            socket.emit("start_game")
          }
        }, 1000)
      }, timeUntilCrash)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)
    })
  })

  return io
}

module.exports = { initializeSocket }

