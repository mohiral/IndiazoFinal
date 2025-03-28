// Utility file to generate consistent gameIds across the application
const { v4: uuidv4 } = require("uuid")

/**
 * Generates a consistent gameId that will be used across all parts of the application
 * @returns {string} A UUID format gameId
 */
const generateGameId = () => {
  return uuidv4()
}

/**
 * Validates if a string is in UUID format
 * @param {string} id - The ID to validate
 * @returns {boolean} True if the ID is a valid UUID
 */
const isValidUuid = (id) => {
  if (!id || typeof id !== "string") return false
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Attempts to extract or convert a gameId to UUID format
 * @param {string} gameId - The gameId to normalize
 * @returns {string} A UUID format gameId if possible, or the original gameId
 */
const normalizeGameId = (gameId) => {
  if (!gameId || typeof gameId !== "string") return gameId

  // If it's already a valid UUID, return it
  if (isValidUuid(gameId)) return gameId

  // Try to extract a UUID if it's embedded in the string
  const uuidMatch = gameId.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i)
  if (uuidMatch) {
    return uuidMatch[1]
  }

  // If it's in the format "game-timestamp", generate a new UUID
  if (gameId.startsWith("game-")) {
    return generateGameId()
  }

  // Return the original if we can't normalize it
  return gameId
}

module.exports = {
  generateGameId,
  isValidUuid,
  normalizeGameId,
}

