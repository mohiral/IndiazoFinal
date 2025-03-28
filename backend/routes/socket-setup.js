// Create a new file to handle socket setup and ensure it's consistent across the app

import { io } from "socket.io-client"
import { initGameClient } from "./game-client"

let socket = null

export function setupSocket() {
  if (socket) return socket

  // Create socket connection
  socket = io("http://localhost:5001", {
    transports: ["websocket"],
  })

  // Initialize game client with this socket
  initGameClient(socket)

  // Set up basic event handlers
  socket.on("connect", () => {
    console.log("Socket connected with ID:", socket.id)

    // Authenticate if user is logged in
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      socket.emit("authenticate", {
        userId: userData.userId,
        username: userData.userName || userData.name,
      })
      console.log("User authenticated with socket:", userData.userId)
    }
  })

  socket.on("disconnect", () => {
    console.log("Socket disconnected")
  })

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error)
  })

  // Add a handler for the request_game_id event on the server side
  socket.on("request_game_id", () => {
    // If we have a current gameId in the gameState, send it back
    if (window.gameState && window.gameState.currentGameId) {
      socket.emit("game_id", window.gameState.currentGameId)
    }
  })

  // Make socket globally available
  window.socket = socket

  return socket
}

// Get the socket instance
export function getSocket() {
  if (!socket) {
    return setupSocket()
  }
  return socket
}

