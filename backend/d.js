// Main server entry point
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { connectDB } from "./config/db.js"
import leadRoutes from "./routes/leadRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
// Add this import after the other route imports
import productRoutes from "./routes/productRoutes.js"
import { errorHandler } from "./middleware/errorHandler.js"
// Add this import after the other imports
import Product from "./models/Product.js"
import fs from "fs"

// Load environment variables
dotenv.config()

// Create an Express app
const app = express()
const httpServer = createServer(app)

// Set up Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins in development
    methods: ["GET", "POST"],
  },
})

// Make io accessible to our routes
app.set("io", io)

// Middleware
app.use(bodyParser.json())
app.use(cors())

// Get the directory name using ES module syntax
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")))

// Serve static files from the frontend build directory
const frontendBuildPath = path.join(
  "C:",
  "Users",
  "Theodore",
  "Downloads",
  "ac rentel",
  "ac rentel",
  "my-project",
  "dist",
)
app.use(express.static(frontendBuildPath))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "public", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Connect to MongoDB
// Add this after the connectDB() call
// Add sample products if none exist
const addSampleProducts = async () => {
  try {
    const count = await Product.countDocuments()
    if (count === 0) {
      console.log("Adding sample products...")
      const sampleProducts = [
        {
          name: "Air Conditioner Model X",
          description: "Energy efficient split AC with cooling and heating",
          price: 35000,
          category: "Split AC",
          image: "https://storage.googleapis.com/a1aa/image/VCX_kBbZwSdw27YiorEtsoVLFxqCayPzCcMojAM8NK4.jpg",
          rating: 4.5,
          stock: 15,
        },
        {
          name: "Window AC Eco Cool",
          description: "Compact window AC for small rooms",
          price: 22000,
          category: "Window AC",
          image: "https://storage.googleapis.com/a1aa/image/bG1K5gbJr3xQHM7BTSRyUmT30qlRLVZsPyP3mk2N_pQ.jpg",
          rating: 4.2,
          stock: 8,
        },
        {
          name: "Portable AC Mini",
          description: "Portable air conditioner for any room",
          price: 18000,
          category: "Portable AC",
          image: "https://storage.googleapis.com/a1aa/image/XuefMoNciXlYoEva-to2WYGCCoXYCs3Mp_Z8Diwqj60.jpg",
          rating: 3.8,
          stock: 12,
        },
      ]

      await Product.insertMany(sampleProducts)
      // console.log("Sample products added successfully")
    }
  } catch (error) {
    console.error("Error adding sample products:", error)
  }
}

// Call the function after connecting to the database
connectDB().then(() => {
  addSampleProducts()
})

// Routes
app.use("/submit-form", leadRoutes)
app.use("/review-form", reviewRoutes)
// Add this route after the other routes
app.use("/products", productRoutes)

// Catch-all route to serve the frontend's index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"))
})

// Error handling middleware
app.use(errorHandler)

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A client connected", socket.id)

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id)
  })
})

// Start the server
const PORT = 5003
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})