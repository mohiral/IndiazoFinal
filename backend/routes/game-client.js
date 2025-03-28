// Create a new file to handle game client-side logic
// This will ensure consistent gameId handling across all components

let currentGameId = null
let gameState = {
  status: "waiting",
  multiplier: 1.0,
}

// Initialize the game client
export function initGameClient(socket) {
  // Listen for game state updates
  socket.on("game_state", (state) => {
    gameState = state
    if (state.currentGameId) {
      currentGameId = state.currentGameId
      console.log("Game client: Updated gameId from game state:", currentGameId)
    }
  })

  // Listen for specific gameId updates
  socket.on("game_id", (gameId) => {
    currentGameId = gameId
    console.log("Game client: Received gameId update:", currentGameId)
  })

  // Request the current gameId
  socket.emit("request_game_id")
}

// Get the current gameId
export function getCurrentGameId() {
  return currentGameId
}

// Get the current game state
export function getGameState() {
  return gameState
}

// Update the server with a game transaction
export async function updateGameTransaction(userId, gameResult, betAmount, winAmount, sectionId) {
  if (!currentGameId) {
    console.error("Cannot update game transaction: No gameId available")
    return { error: true, message: "No game ID available" }
  }

  try {
    console.log(`Updating game transaction with gameId: ${currentGameId}`)

    const payload = {
      userId,
      gameResult,
      betAmount,
      winAmount,
      gameId: currentGameId,
      sectionId,
    }

    const response = await fetch("http://localhost:5001/api/update-balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server returned error:", response.status, errorText)
      return { error: true, message: `Server error: ${response.status}` }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating game transaction:", error)
    return { error: true, message: error.message || "Failed to update transaction" }
  }
}

