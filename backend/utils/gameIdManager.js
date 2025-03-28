/**
 * Game ID Manager
 *
 * This utility ensures that the same gameId is used across different
 * MongoDB collections and routes in the application.
 */

// Store active game IDs in memory
const activeGames = new Map()
let currentGameId = null

// Generate a unique game ID
const generateGameId = () => {
  return `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
}

// Get current active game ID or create a new one
const getCurrentGameId = () => {
  if (!currentGameId) {
    currentGameId = generateGameId()
  }
  return currentGameId
}

// Update the current game ID (typically when a game ends)
const updateGameId = () => {
  currentGameId = generateGameId()
  return currentGameId
}

module.exports = {
  generateGameId,
  getCurrentGameId,
  updateGameId,
}

